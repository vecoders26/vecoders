import { defineField, defineType } from 'sanity';
import { ClockIcon } from '@sanity/icons/Clock';

const HEX = /^#[0-9a-f]{6}$/i;

export const timelineEntry = defineType({
  name: 'timelineEntry',
  title: 'Timeline year',
  type: 'document',
  icon: ClockIcon,
  fields: [
    defineField({ name: 'year', type: 'string', validation: (rule) => rule.required().regex(/^\d{4}$/, { name: 'year' }) }),
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'description', type: 'text', rows: 5 }),
    defineField({
      name: 'themeColor',
      title: 'Theme colour',
      description: 'Accent colour for this year\'s card, as a hex code like #EF6522.',
      type: 'string',
      options: {
        list: [
          { title: 'Orange', value: '#EF6522' },
          { title: 'Cyan', value: '#06b6d4' },
          { title: 'Emerald', value: '#10b981' },
          { title: 'Purple', value: '#a855f7' },
        ],
      },
      initialValue: '#EF6522',
      validation: (rule) => rule.required().custom((v) => (!v || HEX.test(v) ? true : 'Use a hex colour like #EF6522')),
    }),
    defineField({ name: 'tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({
      name: 'president',
      type: 'object',
      fields: [
        defineField({ name: 'name', type: 'string' }),
        defineField({ name: 'role', description: 'Short badge, e.g. "Current President".', type: 'string' }),
        defineField({ name: 'title', description: 'e.g. "3rd President of VECODERS".', type: 'string' }),
        defineField({ name: 'photo', type: 'image', options: { hotspot: true } }),
      ],
    }),
  ],
  orderings: [{ title: 'Year (newest first)', name: 'yearDesc', by: [{ field: 'year', direction: 'desc' }] }],
  preview: {
    select: { year: 'year', title: 'title', media: 'president.photo' },
    prepare: ({ year, title, media }) => ({ title: `${year} — ${title || ''}`, media }),
  },
});
