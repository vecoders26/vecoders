import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Store } from '../data/store';
import { EventDescription, EventMeta, EventRules } from '../components/EventInfo';

export default function EventDetails() {
  const { slug } = useParams();
  const [event, setEvent] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    let cancelled = false;
    setEvent(undefined);
    Store.getEventBySlug(slug).then((ev) => {
      if (!cancelled) setEvent(ev);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (event === undefined) {
    return (
      <div className="event-detail" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="admin-login-spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px' }} />
        Loading event...
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="event-detail container" style={{ textAlign: 'center' }}>
        <h1 className="event-detail__title">Event not found</h1>
        <Link to="/events" className="btn-primary">Browse events</Link>
      </div>
    );
  }

  return (
    <div className="event-detail">
      <div className="container" style={{ maxWidth: '900px' }}>
        <Link to="/events" className="event-detail__back">← All events</Link>

        <div
          className="event-detail__banner"
          style={{ backgroundImage: event.image ? `url('${event.image}')` : event.bannerGradient || 'var(--gradient-brand)' }}
        >
          <div className="events-page__card-badge">{event.badge || event.mode}</div>
          {event.isLive && (
            <div className="events-page__card-live">
              <span className="dot-live" /> LIVE
            </div>
          )}
        </div>

        <div className="events-page__card-domain">{event.domainLabel || event.domain}</div>
        <h1 className="event-detail__title">
          {event.icon} {event.name}
        </h1>
        {event.tagline && <p className="event-detail__tagline">{event.tagline}</p>}

        <EventMeta event={event} />
        <EventDescription event={event} />
        <EventRules event={event} />

        {event.registrationOpen ? (
          <Link to={`/register/${event.slug}`} className="btn-primary" style={{ justifyContent: 'center' }}>
            Register for {event.name}
          </Link>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Registrations for this event are closed.</p>
        )}
      </div>
    </div>
  );
}
