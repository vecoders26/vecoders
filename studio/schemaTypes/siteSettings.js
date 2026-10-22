import { defineField, defineType } from 'sanity';
import { CogIcon } from '@sanity/icons/Cog';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'site', title: 'Site', default: true },
    { name: 'stats', title: 'Homepage stats' },
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
    defineField({ name: 'totalMembersCount', title: 'Members', type: 'string', group: 'stats' }),
    defineField({ name: 'totalProjectsCount', title: 'Projects', type: 'string', group: 'stats' }),
    defineField({ name: 'totalHackathonsCount', title: 'Hackathons', type: 'string', group: 'stats' }),
    defineField({ name: 'totalWorkshopsCount', title: 'Workshops', type: 'string', group: 'stats' }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings' }) },
});
