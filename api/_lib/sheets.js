import { contentClient } from './sanity.js';

// Talks to the Apps Script web app in scripts/google-apps-script/Code.gs, which runs as
// the sheet owner's Google account.
const { GOOGLE_SCRIPT_URL, GOOGLE_SCRIPT_SECRET } = process.env;
const TIMEOUT_MS = 8000;

export const sheetsConfigured = Boolean(GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_SECRET);

// One row per team member; the team columns repeat on each of that team's rows,
// so the sheet can be sorted and filtered by team or by person.
export const SHEET_HEADERS = [
  'Registration No',
  'Registered At',
  'Event',
  'Team Name',
  'Team Size',
  'Role',
  'Name',
  'Register No',
  'Email',
  'Phone',
  'Department',
  'Year',
];

// Registrations come from an Indian college, so show times in IST, e.g. "22 Oct 2026, 8:02 PM".
const timeFormat = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export function formatRegisteredAt(iso) {
  return timeFormat.format(new Date(iso)).replace(/\b(am|pm)\b/, (m) => m.toUpperCase());
}

// The script writes plain-text cells, so "+91 …" phones stay as typed. A leading = can still
// become a formula through the API, so prefix ' to keep submitted text as text.
function cell(value) {
  const s = value == null ? '' : String(value);
  return s.startsWith('=') ? `'${s}` : s;
}

async function callScript(payload) {
  const res = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, secret: GOOGLE_SCRIPT_SECRET }),
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) throw new Error(`Apps Script ${payload.action} failed: ${data?.error || res.status}`);
  return data;
}

// Creates the event's sheet (owned by the script's account) and stores its link on the event.
// Returns { sheetId, sheetUrl }.
export async function createEventSheet(event) {
  const { id, url } = await callScript({
    action: 'createSheet',
    title: event.name,
    headers: SHEET_HEADERS,
  });
  // Also patch an open draft, otherwise publishing it later would drop the link.
  const ids = [event._id];
  const draftId = `drafts.${event._id}`;
  if (await contentClient.fetch('defined(*[_id == $id][0]._id)', { id: draftId }, { perspective: 'raw' })) ids.push(draftId);
  const tx = contentClient.transaction();
  ids.forEach((docId) => tx.patch(docId, (p) => p.setIfMissing({ sheetId: id, sheetUrl: url })));
  await tx.commit();
  // If another request won the race, use whichever sheet the event ended up with.
  const saved = await contentClient.fetch('*[_id == $id][0]{sheetId, sheetUrl}', { id: event._id });
  return { sheetId: saved?.sheetId || id, sheetUrl: saved?.sheetUrl || url };
}

export async function appendRegistration(sheetId, registration) {
  const { members } = registration;
  const team = [
    registration.registrationId,
    formatRegisteredAt(registration.registeredAt),
    registration.event,
    registration.teamName,
    members.length,
  ];
  const rows = members.map((m) =>
    [...team, m.role, m.name, m.registerNumber, m.email, m.phone, m.department, m.year].map(cell),
  );
  await callScript({ action: 'appendRows', id: sheetId, rows, headers: SHEET_HEADERS });
}
