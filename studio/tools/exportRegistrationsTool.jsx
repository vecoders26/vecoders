import { useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { Button, Card, Container, Select, Stack, Text } from '@sanity/ui';
import { DownloadIcon } from '@sanity/icons/Download';

const QUERY = `*[_type == "registration" && (!defined($event) || eventSlug == $event)] | order(registeredAt desc){
  registrationId, event, teamName, registeredAt, status, members[]{name, registerNumber, email, phone, department, year}
}`;

const EVENTS_QUERY = `*[_type == "registration" && defined(eventSlug)]{eventSlug, event}`;

const MEMBER_FIELDS = [
  ['name', 'Name'],
  ['registerNumber', 'Register No'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['department', 'Department'],
  ['year', 'Year'],
];

// Quote every cell and escape embedded quotes so commas/quotes in names can't break columns.
// A leading =, +, - or @ is prefixed with ' to stop spreadsheet formula injection.
function csvCell(value) {
  let s = value == null ? '' : String(value);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

// One row per team, with a block of columns for each member slot.
function toCsv(list) {
  const slots = Math.max(1, ...list.map((r) => r.members?.length || 0));
  const headers = ['Registration No', 'Event', 'Team Name', 'Date', 'Status', 'Total Members'];
  for (let i = 1; i <= slots; i++) MEMBER_FIELDS.forEach(([, label]) => headers.push(`Member ${i} ${label}`));

  const rows = list.map((r) => {
    const cells = [
      r.registrationId,
      r.event || 'General',
      r.teamName || 'Solo',
      r.registeredAt ? new Date(r.registeredAt).toLocaleString() : '',
      r.status || 'Pending',
      r.members?.length || 1,
    ];
    for (let i = 0; i < slots; i++) {
      const m = r.members?.[i] || {};
      MEMBER_FIELDS.forEach(([key]) => cells.push(m[key]));
    }
    return cells.map(csvCell).join(',');
  });
  return [headers.map(csvCell).join(','), ...rows].join('\n');
}

function ExportRegistrations() {
  const client = useClient({ apiVersion: '2025-02-19' });
  const [state, setState] = useState({ busy: false, message: '' });
  const [events, setEvents] = useState([]);
  const [eventSlug, setEventSlug] = useState('');

  useEffect(() => {
    client.fetch(EVENTS_QUERY, {}, { perspective: 'published' }).then(
      (rows) => setEvents([...new Map(rows.map((r) => [r.eventSlug, r.event])).entries()]),
      () => setEvents([]),
    );
  }, [client]);

  const handleExport = async () => {
    setState({ busy: true, message: '' });
    try {
      const list = await client.fetch(QUERY, { event: eventSlug || null }, { perspective: 'published' });
      const blob = new Blob([toCsv(list)], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `VECODERS_Registrations_${eventSlug ? `${eventSlug}_` : ''}${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setState({ busy: false, message: `Exported ${list.length} registrations.` });
    } catch (err) {
      setState({ busy: false, message: `Export failed: ${err.message}` });
    }
  };

  return (
    <Container width={1} padding={5}>
      <Card padding={4} radius={3} shadow={1}>
        <Stack space={4}>
          <Text size={3} weight="semibold">Export registrations</Text>
          <Text muted>Downloads registrations as a CSV file, one row per team.</Text>
          <Select value={eventSlug} onChange={(e) => setEventSlug(e.currentTarget.value)}>
            <option value="">All events</option>
            {events.map(([slug, name]) => (
              <option key={slug} value={slug}>{name || slug}</option>
            ))}
          </Select>
          <Button icon={DownloadIcon} text="Download CSV" tone="primary" loading={state.busy} onClick={handleExport} />
          {state.message && <Text size={1}>{state.message}</Text>}
        </Stack>
      </Card>
    </Container>
  );
}

export const exportRegistrationsTool = {
  name: 'export-registrations',
  title: 'Export CSV',
  icon: DownloadIcon,
  component: ExportRegistrations,
};
