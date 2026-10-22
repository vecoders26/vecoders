import { defineField, defineType } from 'sanity';
import { HelpCircleIcon } from '@sanity/icons/HelpCircle';

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({ name: 'question', type: 'string', validation: (rule) => rule.required().max(200) }),
    defineField({ name: 'answer', type: 'text', rows: 5, validation: (rule) => rule.required() }),
    defineField({
      name: 'order',
      title: 'Display order',
      description: 'Lower numbers show first on the home page.',
      type: 'number',
      initialValue: 10,
    }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'question', subtitle: 'answer' } },
});
