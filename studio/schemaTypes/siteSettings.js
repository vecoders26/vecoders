import { defineArrayMember, defineField, defineType } from 'sanity';
import { CogIcon } from '@sanity/icons/Cog';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'site', title: 'Site', default: true },
    { name: 'stats', title: 'Stats' },
    { name: 'legacy', title: 'Home: Legacy' },
    { name: 'about', title: 'About page' },
    { name: 'footer', title: 'Footer' },
  ],
  fields: [
    defineField({ name: 'announcementActive', title: 'Show announcement banner', type: 'boolean', group: 'site', initialValue: true }),
    defineField({ name: 'announcementText', title: 'Announcement text', type: 'string', group: 'site' }),
    defineField({
      name: 'registrationsOpen',
      title: 'Registrations open',
      description: 'Enforced by the registration API as well as the form.',
      type: 'boolean',
      group: 'site',
      initialValue: true,
    }),
    defineField({ name: 'maintenanceMode', title: 'Maintenance mode', type: 'boolean', group: 'site', initialValue: false }),

    defineField({
      name: 'stats',
      title: 'Club stats',
      description: 'Shown in the Home "Our Legacy" section and on the About page.',
      type: 'array',
      group: 'stats',
      of: [
        defineArrayMember({
          name: 'stat',
          type: 'object',
          fields: [
            defineField({ name: 'value', description: 'e.g. "500+"', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'label', description: 'e.g. "Members"', type: 'string', validation: (rule) => rule.required() }),
          ],
          preview: {
            select: { value: 'value', label: 'label' },
            prepare: ({ value, label }) => ({ title: `${value} ${label}` }),
          },
        }),
      ],
    }),

    defineField({ name: 'legacyTitle', title: 'Title', type: 'string', group: 'legacy' }),
    defineField({ name: 'legacyDescription', title: 'Description', type: 'text', rows: 4, group: 'legacy' }),

    defineField({ name: 'aboutHeroLine1', title: 'Hero line 1', description: 'e.g. "SINCE"', type: 'string', group: 'about' }),
    defineField({ name: 'aboutHeroLine2', title: 'Hero line 2', description: 'e.g. "2023"', type: 'string', group: 'about' }),
    defineField({ name: 'aboutIntro', title: 'Intro paragraph', type: 'text', rows: 6, group: 'about' }),
    defineField({ name: 'aboutBentoHeadline', title: 'Stats grid headline', type: 'string', group: 'about' }),
    defineField({ name: 'aboutBentoSubline', title: 'Stats grid subline', type: 'string', group: 'about' }),

    defineField({ name: 'contactEmail', title: 'Contact email', type: 'string', group: 'footer', validation: (rule) => rule.email() }),
    defineField({ name: 'addressLines', title: 'Address lines', type: 'array', of: [{ type: 'string' }], group: 'footer' }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      description: 'Leave a link empty to hide its icon.',
      type: 'object',
      group: 'footer',
      fields: [
        defineField({ name: 'instagram', type: 'url' }),
        defineField({ name: 'linkedin', title: 'LinkedIn', type: 'url' }),
        defineField({ name: 'github', title: 'GitHub', type: 'url' }),
        defineField({ name: 'x', title: 'X / Twitter', type: 'url' }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings' }) },
});
