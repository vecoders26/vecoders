// Uploads the site's original hardcoded content (src/data/defaults.js) to Sanity as starting data.
// Safe to re-run: documents are created only if missing and settings fields only if unset,
// so edits made in Studio are never overwritten.
// Usage: node --env-file=.env scripts/seed-content.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';
import { DEFAULT_FAQS, DEFAULT_PATRONS, DEFAULT_SETTINGS, DEFAULT_TIMELINE } from '../src/data/defaults.js';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_CONTENT_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2025-02-19',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const key = (i) => `k${i}`;
const exists = async (id) => Boolean(await client.fetch('defined(*[_id == $id][0]._id)', { id }));

async function uploadPublicImage(publicPath) {
  const file = path.join(import.meta.dirname, '..', 'public', publicPath);
  const asset = await client.assets.upload('image', fs.createReadStream(file), { filename: path.basename(file) });
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
}

const tx = client.transaction();

for (const { id, ...faq } of DEFAULT_FAQS) {
  tx.createIfNotExists({ _id: id, _type: 'faq', ...faq });
}

for (const { id, photo, ...patron } of DEFAULT_PATRONS) {
  tx.createIfNotExists({ _id: id, _type: 'patron', ...patron });
}

for (const { id, president, ...entry } of DEFAULT_TIMELINE) {
  // Upload the president photo only for entries that don't exist yet, to avoid orphan assets.
  if (await exists(id)) continue;
  const { photo, ...person } = president;
  tx.createIfNotExists({
    _id: id,
    _type: 'timelineEntry',
    ...entry,
    president: { ...person, ...(photo ? { photo: await uploadPublicImage(photo) } : {}) },
  });
  console.log(`uploaded photo for ${id}`);
}

const {
  announcementActive,
  announcementText,
  registrationsOpen,
  maintenanceMode,
  stats,
  addressLines,
  socialLinks,
  ...textFields
} = DEFAULT_SETTINGS;

tx.createIfNotExists({ _id: 'siteSettings', _type: 'siteSettings' });
tx.patch('siteSettings', (p) =>
  p
    .setIfMissing({
      ...textFields,
      stats: stats.map((s, i) => ({ _key: key(i), _type: 'stat', ...s })),
      addressLines,
      socialLinks,
    })
    // Replaced by `stats`; nothing reads these any more.
    .unset(['totalMembersCount', 'totalProjectsCount', 'totalHackathonsCount', 'totalWorkshopsCount']),
);

const result = await tx.commit();
console.log(`Seed done (${result.results.length} mutations; existing documents were left untouched).`);
