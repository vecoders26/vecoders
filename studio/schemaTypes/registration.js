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
    defineField({ name: 'registrationId', title: 'Registration ID', type: 'string', readOnly: true }),
    defineField({ name: 'event', type: 'string', readOnly: true }),
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
  orderings: [{ title: 'Newest', name: 'registeredAtDesc', by: [{ field: 'registeredAt', direction: 'desc' }] }],
  preview: {
    select: { id: 'registrationId', team: 'teamName', status: 'status' },
    prepare: ({ id, team, status }) => ({ title: team, subtitle: `${id} · ${status}` }),
  },
});
