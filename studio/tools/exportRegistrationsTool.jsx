import { useState } from 'react';
import { useClient } from 'sanity';
import { Button, Card, Container, Stack, Text } from '@sanity/ui';
import { DownloadIcon } from '@sanity/icons/Download';

const QUERY = `*[_type == "registration"] | order(registeredAt desc){
  registrationId, event, teamName, registeredAt, status, members[]{name, email, phone, department, year}
}`;

const HEADERS = ['Registration ID', 'Event', 'Team Name', 'Date', 'Status', 'Lead Name', 'Lead Email', 'Lead Phone', 'Department', 'Year', 'Total Members'];

// Quote every cell and escape embedded quotes so commas/quotes in names can't break columns.
// A leading =, +, - or @ is prefixed with ' to stop spreadsheet formula injection.
function csvCell(value) {
  let s = value == null ? '' : String(value);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function toCsv(list) {
  const rows = list.map((r) => {
    const lead = r.members?.[0] || {};
    return [
      r.registrationId,
      r.event || 'General',
      r.teamName || 'Solo',
      r.registeredAt ? new Date(r.registeredAt).toLocaleString() : '',
      r.status || 'Pending',
      lead.name,
      lead.email,
      lead.phone,
      lead.department,
      lead.year,
      r.members?.length || 1,
    ].map(csvCell).join(',');
  });
  return [HEADERS.map(csvCell).join(','), ...rows].join('\n');
}

function ExportRegistrations() {
  const client = useClient({ apiVersion: '2025-02-19' });
  const [state, setState] = useState({ busy: false, message: '' });

  const handleExport = async () => {
    setState({ busy: true, message: '' });
    try {
      const list = await client.fetch(QUERY, {}, { perspective: 'published' });
      const blob = new Blob([toCsv(list)], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `VECODERS_Registrations_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <Text muted>Downloads every registration in this dataset as a CSV file.</Text>
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
