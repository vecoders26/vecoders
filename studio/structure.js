import { CogIcon } from '@sanity/icons/Cog';
import { SINGLETON_TYPES } from './schemaTypes';

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
      ...S.documentTypeListItems().filter((item) => !SINGLETON_TYPES.includes(item.getId())),
    ]);
