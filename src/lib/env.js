// Single place that reads build-time env vars. Only VITE_* values reach the
// browser bundle, so nothing here may be secret — tokens live in server code only.
function required(name) {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing env var ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

export const env = {
  sanityProjectId: required('VITE_SANITY_PROJECT_ID'),
  sanityDataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  sanityApiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2025-02-19',
  studioUrl: import.meta.env.VITE_STUDIO_URL || '',
};
