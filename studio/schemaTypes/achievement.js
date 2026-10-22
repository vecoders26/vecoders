import { defineField, defineType } from 'sanity';
import { StarIcon } from '@sanity/icons/Star';

export const achievement = defineType({
  name: 'achievement',
  title: 'Achievement',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'category', type: 'string' }),
    defineField({ name: 'desc', title: 'Description', type: 'text', rows: 4 }),
    defineField({ name: 'date', title: 'Date (display text)', type: 'string' }),
    defineField({ name: 'badge', type: 'string' }),
  ],
  preview: { select: { title: 'title', subtitle: 'date' } },
});
