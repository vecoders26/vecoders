import React from 'react';
import { teamSizeLabel } from '../data/store';

// Event facts, description and rules — shared by the event details page and the registration form.

export function EventMeta({ event }) {
  const items = [
    ['Date', [event.dateDisplay, event.timeDisplay].filter(Boolean).join(' · ')],
    ['Mode', event.mode],
    ['Location', event.location],
    ['Team size', teamSizeLabel(event)],
    ['Prize pool', event.pricePool],
    ['Entry fee', event.entryFee],
  ].filter(([, value]) => value);

  return (
    <div className="event-info__meta">
      {items.map(([label, value]) => (
        <div className="event-info__meta-item" key={label}>
          <span className="event-info__meta-label">{label}</span>
          <span className="event-info__meta-value">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function EventDescription({ event }) {
  if (!event.description) return null;
  return (
    <section className="event-info__section">
      <h2 className="event-info__heading">About this event</h2>
      <p className="event-info__description">{event.description}</p>
    </section>
  );
}

export function EventRules({ event }) {
  if (!event.rules?.length) return null;
  return (
    <section className="event-info__section">
      <h2 className="event-info__heading">Rules</h2>
      <ol className="event-info__rules">
        {event.rules.map((rule, i) => (
          <li key={i}>{rule}</li>
        ))}
      </ol>
    </section>
  );
}
