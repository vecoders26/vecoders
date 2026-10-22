import { CogIcon } from '@sanity/icons/Cog';
import { SINGLETON_TYPES } from './schemaTypes';

const PAGE_TYPES = ['timelineEntry', 'patron', 'faq'];

export const contentStructure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site Settings')),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => !SINGLETON_TYPES.includes(item.getId()) && !PAGE_TYPES.includes(item.getId())),
      S.divider(),
      // Content for the About / Home / Timeline pages
      ...PAGE_TYPES.map((type) => S.documentTypeListItem(type)),
    ]);
