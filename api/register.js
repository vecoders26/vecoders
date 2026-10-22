import { contentClient, registrationsClient, sanityConfigured } from './_lib/sanity.js';
import { appendRegistration, createEventSheet, sheetsConfigured } from './_lib/sheets.js';

// Events without min/max set fall back to the Studio defaults (1–3). Absolute cap regardless of event settings. Keep in sync with MAX_TEAM_SIZE in studio/schemaTypes/event.js.
const HARD_MAX_MEMBERS = 10;
const MAX_LEN = 120;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{7,15}$/;
const REGISTER_NO_RE = /^[A-Z0-9-]{4,20}$/;

const EVENT_QUERY = `*[_type == "event" && slug.current == $slug][0]{
  _id, name, isLive, registrationOpen, minTeamSize, maxTeamSize, sheetId
}`;

// Best-effort per-instance rate limit. Serverless instances don't share memory,
// so swap for Vercel KV / Upstash if abuse becomes a real problem.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}

function cleanString(value, { required = false, max = MAX_LEN } = {}) {
  if (value == null || value === '') {
    if (required) throw new Error('missing');
    return '';
  }
  if (typeof value !== 'string') throw new Error('type');
  const trimmed = value.trim();
  if (required && !trimmed) throw new Error('missing');
  if (trimmed.length > max) throw new Error('length');
  return trimmed;
}

function validate(body, event) {
  const min = Math.max(1, event.minTeamSize || 1);
  const max = Math.min(HARD_MAX_MEMBERS, Math.max(min, event.maxTeamSize || 3));
  const { members } = body;
  if (!Array.isArray(members) || members.length < min || members.length > max) {
    return { error: min === max ? `This event needs exactly ${min} member${min > 1 ? 's' : ''}.` : `This event needs between ${min} and ${max} members.` };
  }

  try {
    const cleanMembers = members.map((m, idx) => {
      const member = {
        _key: `m${idx}`,
        _type: 'member',
        role: idx === 0 ? 'Team Lead / Member 1' : `Member ${idx + 1}`,
        name: cleanString(m?.name, { required: true }),
        registerNumber: cleanString(m?.registerNumber, { required: true, max: 20 }).toUpperCase(),
        email: cleanString(m?.email, { required: true }).toLowerCase(),
        department: cleanString(m?.department),
        year: cleanString(m?.year, { max: 40 }),
        phone: cleanString(m?.phone, { required: true, max: 20 }),
      };
      if (!REGISTER_NO_RE.test(member.registerNumber)) throw new Error(`Member ${idx + 1} has an invalid register number.`);
      if (!EMAIL_RE.test(member.email)) throw new Error(`Member ${idx + 1} has an invalid email.`);
      if (!PHONE_RE.test(member.phone)) throw new Error(`Member ${idx + 1} has an invalid phone number.`);
      return member;
    });

    return {
      value: {
        event: event.name,
        eventSlug: body.eventSlug,
        eventId: event._id,
        teamName: cleanString(body.teamName) || cleanMembers[0].name,
        members: cleanMembers,
      },
    };
  } catch (err) {
    const known = err.message.startsWith('Member');
    return { error: known ? err.message : 'Please fill in every required field (name, register number, email, phone).' };
  }
}

// Plain ascending registration numbers (1, 2, 3, …) shared across all events. The _id doubles
// as a uniqueness lock: create() fails if another request claimed the same number, so we retry
// and the next read sees that number as taken.
async function createRegistration(value) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const last = await registrationsClient.fetch(
      '*[_type == "registration" && defined(registrationId)] | order(registrationId desc)[0].registrationId',
    );
    const registrationId = (Number(last) || 0) + 1;
    try {
      return await registrationsClient.create({
        _id: `registration-${registrationId}`,
        _type: 'registration',
        registrationId,
        registeredAt: new Date().toISOString(),
        status: 'Pending',
        ...value,
      });
    } catch (err) {
      if (err.statusCode !== 409) throw err;
    }
  }
  throw new Error('Could not allocate a registration number');
}

// Sanity holds the canonical copy, so a Sheets failure is logged rather than shown to the user.
async function syncToSheet(event, registration) {
  if (!sheetsConfigured) return;
  try {
    const sheetId = event.sheetId || (await createEventSheet(event)).sheetId;
    await appendRegistration(sheetId, registration);
  } catch (err) {
    console.error(`register: sheet sync failed for ${registration.registrationId}`, err);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!sanityConfigured) {
    console.error('register: missing SANITY_PROJECT_ID or SANITY_WRITE_TOKEN');
    return res.status(500).json({ error: 'Registration is temporarily unavailable.' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};

  // Honeypot: real users never see or fill this field.
  if (body.website) return res.status(200).json({ id: 0 });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many registrations from this network. Try again later.' });
  }

  if (typeof body.eventSlug !== 'string' || !body.eventSlug) {
    return res.status(400).json({ error: 'Please choose an event to register for.' });
  }

  try {
    const [settings, event] = await Promise.all([
      contentClient.fetch('*[_id == "siteSettings"][0]{registrationsOpen}'),
      contentClient.fetch(EVENT_QUERY, { slug: body.eventSlug }),
    ]);
    if (!event) return res.status(404).json({ error: 'That event no longer exists.' });
    if (settings?.registrationsOpen === false || !event.isLive || event.registrationOpen === false) {
      return res.status(403).json({ error: 'Registrations for this event are closed.' });
    }

    const { value, error } = validate(body, event);
    if (error) return res.status(400).json({ error });

    const registration = await createRegistration(value);
    await syncToSheet(event, registration);
    return res.status(201).json({ id: registration.registrationId });
  } catch (err) {
    console.error('register: failed to save registration', err);
    return res.status(500).json({ error: 'Something went wrong saving your registration. Please try again.' });
  }
}
