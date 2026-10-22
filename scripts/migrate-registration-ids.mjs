// One-off: move registrations from `registration-<n>` IDs to `registration.<n>`.
// Dotted IDs are never served to unauthenticated requests, so registrations stay private
// once the registrations dataset is public (Sanity's free plan has no private datasets).
// Usage: node --env-file=.env scripts/migrate-registration-ids.mjs
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_REGISTRATIONS_DATASET || 'registrations',
  apiVersion: process.env.SANITY_API_VERSION || '2025-02-19',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
  perspective: 'raw',
});

const docs = await client.fetch('*[_type == "registration" && _id in path("*")]');
for (const doc of docs) {
  const { _id, _rev, _createdAt, _updatedAt, _system, ...fields } = doc;
  const newId = `registration.${doc.registrationId}`;
  await client.transaction().createIfNotExists({ ...fields, _id: newId }).delete(_id).commit();
  console.log(`${_id} -> ${newId}`);
}
console.log(`Migrated ${docs.length} registration(s).`);
