import { createClient } from '@sanity/client';
import { env } from '../lib/env';

// Read-only, tokenless client for the public dataset (served from Sanity's CDN).
export const sanity = createClient({
  projectId: env.sanityProjectId,
  dataset: env.sanityDataset,
  apiVersion: env.sanityApiVersion,
  useCdn: true,
  perspective: 'published',
});
