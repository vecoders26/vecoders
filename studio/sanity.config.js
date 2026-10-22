import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { DocumentsIcon } from '@sanity/icons/Documents';
import { UsersIcon } from '@sanity/icons/Users';
import { contentSchemaTypes, registrationSchemaTypes, SINGLETON_TYPES } from './schemaTypes';
import { contentStructure } from './structure';
import { exportRegistrationsTool } from './tools/exportRegistrationsTool';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const contentDataset = process.env.SANITY_STUDIO_DATASET || 'production';
const registrationsDataset = process.env.SANITY_STUDIO_REGISTRATIONS_DATASET || 'registrations';

if (!projectId) {
  throw new Error('Missing SANITY_STUDIO_PROJECT_ID — copy studio/.env.example to studio/.env');
}

export default defineConfig([
  {
    name: 'content',
    title: 'VECODERS Content',
    basePath: '/content',
    icon: DocumentsIcon,
    projectId,
    dataset: contentDataset,
    plugins: [structureTool({ structure: contentStructure }), visionTool()],
    schema: {
      types: contentSchemaTypes,
      // Keep singletons out of the global "Create new" menu
      templates: (templates) => templates.filter(({ schemaType }) => !SINGLETON_TYPES.includes(schemaType)),
    },
    document: {
      actions: (actions, { schemaType }) =>
        SINGLETON_TYPES.includes(schemaType)
          ? actions.filter(({ action }) => !['unpublish', 'delete', 'duplicate'].includes(action))
          : actions,
    },
  },
  {
    name: 'registrations',
    title: 'Registrations (private)',
    basePath: '/registrations',
    icon: UsersIcon,
    projectId,
    dataset: registrationsDataset,
    plugins: [structureTool()],
    tools: [exportRegistrationsTool],
    schema: {
      types: registrationSchemaTypes,
      // Registrations are created by the public form only
      templates: () => [],
    },
  },
]);
