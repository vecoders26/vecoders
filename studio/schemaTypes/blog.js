import { defineField, defineType } from 'sanity';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';

export const blog = defineType({
  name: 'blog',
  title: 'Blog Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required().max(140) }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'desc',
      title: 'Summary',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(300),
    }),
    defineField({ name: 'content', type: 'text', rows: 16 }),
    defineField({ name: 'author', type: 'string', initialValue: 'VECODERS Core' }),
    defineField({ name: 'category', type: 'string', initialValue: 'Engineering' }),
    defineField({ name: 'readTime', title: 'Read time', type: 'string', initialValue: '5 min read' }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'imageUrl',
      title: 'External image URL',
      description: 'Used only when no image is uploaded above.',
      type: 'url',
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
  ],
  orderings: [{ title: 'Newest', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'category', media: 'image' } },
});
