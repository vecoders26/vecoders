import { createClient } from '@sanity/client';

// Server-only: these env vars are set in Vercel (or .env for `vercel dev`) and never reach the browser.
const { SANITY_PROJECT_ID, SANITY_WRITE_TOKEN } = process.env;
const API_VERSION = process.env.SANITY_API_VERSION || '2025-02-19';
const CONTENT_DATASET = process.env.SANITY_CONTENT_DATASET || 'production';
const REGISTRATIONS_DATASET = process.env.SANITY_REGISTRATIONS_DATASET || 'registrations';

const MAX_MEMBERS = 3;
const MAX_LEN = 120;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{7,15}$/;

const contentClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: CONTENT_DATASET,
  apiVersion: API_VERSION,
  useCdn: false,
});

const registrationsClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: REGISTRATIONS_DATASET,
  apiVersion: API_VERSION,
  token: SANITY_WRITE_TOKEN,
  useCdn: false,
});

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

function validate(body) {
  if (!body || typeof body !== 'object') return { error: 'Invalid request body.' };
  const { members } = body;
  if (!Array.isArray(members) || members.length < 1 || members.length > MAX_MEMBERS) {
    return { error: `A team must have between 1 and ${MAX_MEMBERS} members.` };
  }

  try {
    const cleanMembers = members.map((m, idx) => {
      const member = {
        _key: `m${idx}`,
        _type: 'member',
        role: idx === 0 ? 'Team Lead / Member 1' : `Member ${idx + 1}`,
        name: cleanString(m?.name, { required: true }),
        email: cleanString(m?.email, { required: true }).toLowerCase(),
        department: cleanString(m?.department),
        year: cleanString(m?.year, { max: 40 }),
        phone: cleanString(m?.phone, { required: true, max: 20 }),
      };
      if (!EMAIL_RE.test(member.email)) throw new Error(`Member ${idx + 1} has an invalid email.`);
      if (!PHONE_RE.test(member.phone)) throw new Error(`Member ${idx + 1} has an invalid phone number.`);
      return member;
    });

    return {
      value: {
        event: cleanString(body.event) || 'General',
        teamName: cleanString(body.teamName) || 'Solo',
        members: cleanMembers,
      },
    };
  } catch (err) {
    const known = err.message.startsWith('Member');
    return { error: known ? err.message : 'Please fill in every required field (name, email, phone).' };
  }
}

// Sequential, human-readable IDs (REG-2026-001). The _id doubles as a uniqueness
// lock: create() fails if another request claimed the same number, so we retry.
async function createRegistration(value) {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await registrationsClient.fetch(
      'count(*[_type == "registration" && string::startsWith(registrationId, $prefix)])',
      { prefix: `REG-${year}-` },
    );
    const registrationId = `REG-${year}-${String(count + 1 + attempt).padStart(3, '0')}`;
    try {
      await registrationsClient.create({
        _id: `registration-${registrationId}`,
        _type: 'registration',
        registrationId,
        registeredAt: new Date().toISOString(),
        status: 'Pending',
        ...value,
      });
      return registrationId;
    } catch (err) {
      if (err.statusCode !== 409) throw err;
    }
  }
  throw new Error('Could not allocate a registration ID');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!SANITY_PROJECT_ID || !SANITY_WRITE_TOKEN) {
    console.error('register: missing SANITY_PROJECT_ID or SANITY_WRITE_TOKEN');
    return res.status(500).json({ error: 'Registration is temporarily unavailable.' });
  }

  const body = req.body || {};

  // Honeypot: real users never see or fill this field.
  if (body.website) return res.status(200).json({ id: 'REG-OK' });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many registrations from this network. Try again later.' });
  }

  const { value, error } = validate(body);
  if (error) return res.status(400).json({ error });

  try {
    const settings = await contentClient.fetch('*[_id == "siteSettings"][0]{registrationsOpen}');
    if (settings?.registrationsOpen === false) {
      return res.status(403).json({ error: 'Registrations are currently closed.' });
    }

    const id = await createRegistration(value);
    return res.status(201).json({ id });
  } catch (err) {
    console.error('register: failed to save registration', err);
    return res.status(500).json({ error: 'Something went wrong saving your registration. Please try again.' });
  }
}
