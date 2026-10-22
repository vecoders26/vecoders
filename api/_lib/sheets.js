import { contentClient } from './sanity.js';

// Talks to the Apps Script web app in scripts/google-apps-script/Code.gs, which runs as
// the sheet owner's Google account.
const { GOOGLE_SCRIPT_URL, GOOGLE_SCRIPT_SECRET } = process.env;
const TIMEOUT_MS = 8000;

export const sheetsConfigured = Boolean(GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_SECRET);

const MEMBER_COLUMNS = ['Name', 'Register No', 'Email', 'Phone', 'Department', 'Year'];

export function sheetHeaders(memberSlots) {
  const headers = ['Registration ID', 'Registered At', 'Event', 'Team Name', 'Team Size'];
  for (let i = 1; i <= memberSlots; i++) MEMBER_COLUMNS.forEach((c) => headers.push(`Member ${i} ${c}`));
  return headers;
}

// Sheets treats a leading = + - @ as a formula; prefix ' so submitted text stays text.
function cell(value) {
  const s = value == null ? '' : String(value);
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
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
    headers: sheetHeaders(event.maxTeamSize || 3),
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
  const row = [
    registration.registrationId,
    registration.registeredAt,
    registration.event,
    registration.teamName,
    members.length,
  ];
  members.forEach((m) => row.push(m.name, m.registerNumber, m.email, m.phone, m.department, m.year));
  await callScript({ action: 'appendRow', id: sheetId, row: row.map(cell), headers: sheetHeaders(members.length) });
}
