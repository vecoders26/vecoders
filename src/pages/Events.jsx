import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Store, teamSizeLabel } from '../data/store';
import { renderGlowLetters } from '../components/GlowText';

export default function Events() {
  const [eventsList, setEventsList] = useState([]);
  const [activeTab, setActiveTab] = useState('live');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    const data = await Store.getEvents();
    setEventsList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return eventsList.filter((ev) => {
      const isLiveMatch = activeTab === 'live' ? ev.isLive : !ev.isLive;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        ev.name.toLowerCase().includes(searchLower) ||
        (ev.domainLabel && ev.domainLabel.toLowerCase().includes(searchLower)) ||
        (ev.tagline && ev.tagline.toLowerCase().includes(searchLower));
      return isLiveMatch && matchesSearch;
    });
  }, [eventsList, activeTab, searchTerm]);

  return (
    <div className="events-page">
      {/* ========== EVENTS HERO ========== */}
      <section className="events-page-hero">
        <div className="events-page-hero__perspective" id="eventsPerspective" />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-impact)', fontSize: 'clamp(2.8rem, 7.5vw, 5.5rem)', letterSpacing: '6px', color: 'var(--cream)', margin: '0 0 10px 0' }}>
            {renderGlowLetters('EVENTS & HACKATHONS', 'glow-cyan')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', letterSpacing: '2px', margin: 0 }}>
            {renderGlowLetters('Compete, Build, Innovate with VECODERS', 'glow-cyan')}
          </p>
        </div>
      </section>

      {/* ========== EVENTS CONTENT ========== */}
      <section className="events-page-content">
        <div className="container">
          {/* Live / Past Toggle */}
          <div className="events-page__toggle-wrap">
            <div className={`events-page__toggle ${activeTab === 'past' ? 'past' : ''}`} id="eventsPageToggle">
              <div
                className="events-page__toggle-slider"
                style={{
                  transform: activeTab === 'past' ? 'translateX(100%)' : 'translateX(0)',
                }}
              />
              <button
                className={`events-page__toggle-btn ${activeTab === 'live' ? 'active' : ''}`}
                onClick={() => setActiveTab('live')}
              >
                Live
              </button>
              <button
                className={`events-page__toggle-btn ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                Past
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="events-page__search-wrap">
            <div className="events-page__search">
              <svg
                className="events-page__search-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                id="eventsSearch"
                className="events-page__search-input"
                placeholder="Search events, tracks, or domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div className="admin-login-spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px' }} />
              Loading events...
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="events-page__grid" id="eventsPageGrid">
              {filteredEvents.map((ev) => (
                <div className="events-page__card" key={ev.id} id={`event-card-${ev.id}`}>
                  <div
                    className="events-page__card-img"
                    style={{
                      backgroundImage: `url('${ev.image}')`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                    }}
                  >
                    <div className="events-page__card-badge">{ev.badge || ev.mode}</div>
                    {ev.isLive && (
                      <div className="events-page__card-live">
                        <span className="dot-live" /> LIVE
                      </div>
                    )}
                  </div>
                  <div className="events-page__card-body">
                    <div className="events-page__card-domain">{ev.domainLabel || ev.domain}</div>
                    <h3 className="events-page__card-title">{ev.name}</h3>
                    <p className="events-page__card-tagline">{ev.tagline}</p>
                    <div className="events-page__card-meta">
                      <span>📅 {ev.dateDisplay}</span>
                      {ev.pricePool && <span>💰 {ev.pricePool}</span>}
                      <span>👥 {teamSizeLabel(ev)}</span>
                    </div>
                    <div className="events-page__card-actions">
                      {ev.registrationOpen && (
                        <Link to={`/register/${ev.slug}`} className="btn-primary events-page__card-btn">
                          Register
                        </Link>
                      )}
                      <Link to={`/events/${ev.slug}`} className="btn-outline events-page__card-btn">
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="events-page__empty" id="eventsPageEmpty">
              <p>No events found matching "{searchTerm}".</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
