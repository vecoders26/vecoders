import { defineField, defineType } from 'sanity';
import { CalendarIcon } from '@sanity/icons/Calendar';

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({ name: 'name', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'edition', type: 'string' }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Hackathon', value: 'hackathon' },
          { title: 'Workshop', value: 'workshop' },
          { title: 'Competition', value: 'competition' },
          { title: 'Talk', value: 'talk' },
        ],
      },
      initialValue: 'hackathon',
    }),
    defineField({ name: 'domain', type: 'string' }),
    defineField({ name: 'domainLabel', title: 'Domain label', type: 'string' }),
    defineField({
      name: 'isLive',
      title: 'Live / upcoming',
      description: 'Off moves the event to the "Past" tab.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({ name: 'startDate', title: 'Start date', type: 'datetime' }),
    defineField({ name: 'dateDisplay', title: 'Date (display text)', type: 'string' }),
    defineField({ name: 'timeDisplay', title: 'Time (display text)', type: 'string' }),
    defineField({ name: 'location', type: 'string' }),
    defineField({
      name: 'mode',
      type: 'string',
      options: { list: ['Online', 'Offline', 'Hybrid'], layout: 'radio' },
      initialValue: 'Online',
    }),
    defineField({ name: 'teamSize', title: 'Team size', type: 'string' }),
    defineField({ name: 'pricePool', title: 'Prize pool', type: 'string' }),
    defineField({ name: 'entryFee', title: 'Entry fee', type: 'string', initialValue: 'Free' }),
    defineField({ name: 'badge', type: 'string' }),
    defineField({ name: 'tagline', type: 'string' }),
    defineField({ name: 'bannerGradient', title: 'Banner gradient (CSS)', type: 'string' }),
    defineField({ name: 'icon', title: 'Icon (emoji)', type: 'string', initialValue: '🚀' }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'imageUrl',
      title: 'External image URL',
      description: 'Used only when no image is uploaded above.',
      type: 'url',
    }),
  ],
  orderings: [{ title: 'Start date', name: 'startDateDesc', by: [{ field: 'startDate', direction: 'desc' }] }],
  preview: { select: { title: 'name', subtitle: 'dateDisplay', media: 'image' } },
});
