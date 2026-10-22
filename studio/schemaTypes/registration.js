import { defineArrayMember, defineField, defineType } from 'sanity';
import { UsersIcon } from '@sanity/icons/Users';
import { UserIcon } from '@sanity/icons/User';

export const REGISTRATION_STATUSES = ['Pending', 'Approved', 'Rejected'];

export const registration = defineType({
  name: 'registration',
  title: 'Registration',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({ name: 'registrationId', title: 'Registration no.', type: 'number', readOnly: true }),
    defineField({ name: 'event', type: 'string', readOnly: true }),
    defineField({ name: 'eventSlug', title: 'Event slug', type: 'string', readOnly: true }),
    defineField({ name: 'eventId', title: 'Event ID', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'teamName', title: 'Team name', type: 'string', readOnly: true }),
    defineField({ name: 'registeredAt', title: 'Registered at', type: 'datetime', readOnly: true }),
    defineField({
      name: 'status',
      type: 'string',
      options: { list: REGISTRATION_STATUSES, layout: 'radio' },
      initialValue: 'Pending',
    }),
    defineField({
      name: 'members',
      type: 'array',
      readOnly: true,
      of: [
        defineArrayMember({
          name: 'member',
          type: 'object',
          icon: UserIcon,
          fields: [
            defineField({ name: 'role', type: 'string' }),
            defineField({ name: 'name', type: 'string' }),
            defineField({ name: 'registerNumber', title: 'Register number', type: 'string' }),
            defineField({ name: 'email', type: 'string' }),
            defineField({ name: 'department', type: 'string' }),
            defineField({ name: 'year', type: 'string' }),
            defineField({ name: 'phone', type: 'string' }),
          ],
          preview: { select: { title: 'name', subtitle: 'role' } },
        }),
      ],
    }),
  ],
  orderings: [
    { title: 'Newest', name: 'registeredAtDesc', by: [{ field: 'registeredAt', direction: 'desc' }] },
    { title: 'Registration no.', name: 'registrationIdAsc', by: [{ field: 'registrationId', direction: 'asc' }] },
  ],
  preview: {
    select: { id: 'registrationId', team: 'teamName', status: 'status', event: 'event' },
    prepare: ({ id, team, status, event }) => ({ title: team, subtitle: `#${id} · ${event || 'General'} · ${status}` }),
  },
});
