import { defineField, defineType } from 'sanity';
import { StarIcon } from '@sanity/icons/Star';

export const patron = defineType({
  name: 'patron',
  title: 'Patron',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({ name: 'name', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'role',
      description: 'Shown under the name, e.g. "Chief Patron, Principal".',
      type: 'string',
    }),
    defineField({
      name: 'photo',
      description: 'Optional. Without a photo the card shows the brand gradient.',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      description: 'Lower numbers show first on the About page.',
      type: 'number',
      initialValue: 10,
    }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
});
