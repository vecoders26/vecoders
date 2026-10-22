import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Store, teamSizeLabel } from '../data/store';
import { renderGlowLetters } from '../components/GlowText';
import { EventDescription, EventRules } from '../components/EventInfo';

const memberRole = (idx) => (idx === 0 ? 'Team Lead / Member 1' : `Member ${idx + 1}`);

const blankMember = (idx) => ({
  id: `${Date.now()}-${idx}`,
  role: memberRole(idx),
  name: '',
  registerNumber: '',
  email: '',
  department: '',
  year: '1st Year',
  phone: '',
});

const initialMembers = (event) => Array.from({ length: Math.max(1, event?.minTeamSize || 1) }, (_, i) => blankMember(i));

const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '12px 14px', background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'var(--white)', fontSize: '0.9rem', fontFamily: 'var(--font-body)', outline: 'none' };

export default function Register() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(undefined); // undefined = loading, null = not found
  const [openEvents, setOpenEvents] = useState(undefined);
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState(() => initialMembers(null));

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [settings, setSettings] = useState({
    registrationsOpen: true,
  });

  useEffect(() => {
    Store.getSettings().then(setSettings);
    Store.getOpenEvents().then(setOpenEvents);
  }, []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setEvent(undefined);
    Store.getEventBySlug(slug).then((ev) => {
      if (cancelled) return;
      setEvent(ev);
      setMembers(initialMembers(ev));
      setTeamName('');
      setSubmitted(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const minMembers = Math.max(1, event?.minTeamSize || 1);
  const maxMembers = Math.max(minMembers, event?.maxTeamSize || 1);

  const departments = [
    'Computer Science and Engineering (CSE)',
    'Information Technology (IT)',
    'Artificial Intelligence & Data Science (AI & DS)',
    'Cybersecurity (CS)',
    'Electronics & Communication Engineering (ECE)',
    'Electrical & Electronics Engineering (EEE)',
    'Mechanical Engineering (MECH)',
    'Civil Engineering (CIVIL)',
    'Other Department',
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

  const handleMemberChange = (index, field, value) => {
    setMembers((prev) => prev.map((m, idx) => (idx === index ? { ...m, [field]: value } : m)));
  };

  const addMember = () => {
    if (members.length >= maxMembers) return;
    setMembers([...members, blankMember(members.length)]);
  };

  const removeMember = (index) => {
    if (members.length <= minMembers) return;
    const updated = members.filter((_, idx) => idx !== index);
    setMembers(updated.map((m, idx) => ({ ...m, role: memberRole(idx) })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (settings.registrationsOpen === false) {
      alert('Registrations are currently closed by administration.');
      return;
    }
    setLoading(true);

    try {
      await Store.addRegistration({
        eventSlug: event.slug,
        teamName: maxMembers > 1 ? teamName.trim() || `${members[0].name.trim()}'s Team` : '',
        members: members.map(({ name, registerNumber, email, department, year, phone }) => ({
          name,
          registerNumber,
          email,
          department,
          year,
          phone,
        })),
        website: honeypot,
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setTeamName('');
    setMembers(initialMembers(event));
  };

  // /register with no event: go to the latest open event.
  if (!slug) {
    if (openEvents === undefined) return <RegisterStatus loading />;
    if (openEvents.length === 0) return <RegisterStatus message="There are no events open for registration right now." />;
    return <Navigate to={`/register/${openEvents[0].slug}`} replace />;
  }
  if (event === undefined) return <RegisterStatus loading />;
  if (event === null) return <RegisterStatus message="We couldn't find that event." />;
  if (!event.registrationOpen || settings.registrationsOpen === false) {
    return <RegisterStatus message={`Registrations for ${event.name} are closed.`} />;
  }

  const otherOpenEvents = (openEvents || []).filter((ev) => ev.slug !== event.slug);

  return (
    <div className="register-page" style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="section-label">
            <span className="section-label__dot" />
            <span className="section-label__text">Onboarding</span>
            <span className="section-label__dot" />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-impact)',
              fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
              letterSpacing: '4px',
              color: 'var(--cream)',
              marginBottom: '12px',
            }}
          >
            {renderGlowLetters('VECODERS REGISTRATION', 'glow-blue')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto' }}>
            Register your team or apply individually for upcoming hackathons, tech workshops, and community access.
          </p>
        </div>

        {/* Selected event */}
        <div
          style={{
            background: 'rgba(239, 101, 34, 0.06)',
            border: '1px solid rgba(239, 101, 34, 0.3)',
            borderRadius: '18px',
            padding: '24px',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <span style={labelStyle}>Registering for</span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--cream)', margin: '0 0 6px' }}>
                {event.icon} {event.name}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                {[event.dateDisplay, event.mode, teamSizeLabel(event)].filter(Boolean).join(' · ')}
              </p>
            </div>
            {otherOpenEvents.length > 0 && (
              <select
                aria-label="Switch event"
                value={event.slug}
                onChange={(e) => navigate(`/register/${e.target.value}`)}
                style={{ ...inputStyle, width: 'auto', background: '#0d0d0d' }}
              >
                <option value={event.slug}>{event.name}</option>
                {otherOpenEvents.map((ev) => (
                  <option key={ev.slug} value={ev.slug}>{ev.name}</option>
                ))}
              </select>
            )}
          </div>
          {(event.description || event.rules?.length > 0) && (
            <details style={{ marginTop: '18px' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--orange)', fontWeight: '600', fontSize: '0.9rem' }}>
                Event details & rules
              </summary>
              <div style={{ marginTop: '16px' }}>
                <EventDescription event={event} />
                <EventRules event={event} />
              </div>
            </details>
          )}
          <Link to={`/events/${event.slug}`} style={{ display: 'inline-block', marginTop: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            View full event page →
          </Link>
        </div>

        {submitted ? (
          /* Success Screen */
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(239, 101, 34, 0.4)',
              borderRadius: '24px',
              padding: '60px 40px',
              textAlign: 'center',
              boxShadow: '0 0 50px rgba(239, 101, 34, 0.15)',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '2rem',
                color: 'white',
              }}
            >
              ✓
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2rem',
                color: 'var(--cream)',
                marginBottom: '16px',
              }}
            >
              Registration Successful!
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                lineHeight: '1.7',
                maxWidth: '500px',
                margin: '0 auto 30px',
              }}
            >
              You're registered for <strong style={{ color: 'var(--orange)' }}>{event.name}</strong>. We'll reach out at{' '}
              <strong style={{ color: 'var(--orange)' }}>{members[0].email || 'your registered email'}</strong> with next steps.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/events" className="btn-primary">
                Explore Events
              </Link>
              <button className="btn-outline" onClick={resetForm}>
                Register Another Team
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form
            onSubmit={handleSubmit}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: 'clamp(24px, 5vw, 45px)',
              boxShadow: 'var(--inset-border)',
            }}
          >
            {/* Honeypot: hidden from people, filled by bots, rejected by /api/register */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
            />
            {/* Team Identity Header */}
            {maxMembers > 1 && (
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '18px',
                padding: '24px',
                marginBottom: '32px',
              }}
            >
              <h3 style={{ color: '#38BDF8', fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛡️</span> Team Identity
              </h3>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>
                  TEAM / SQUAD NAME (OPTIONAL)
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. CodeWarriors, CyberKnights, QuantumLeap..."
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '6px', margin: 0 }}>
                  Leave blank to use the team lead's name.
                </p>
              </div>
            </div>
            )}

            {/* Members Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '36px' }}>
              {members.map((member, index) => (
                <div
                  key={member.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '18px',
                    padding: '24px',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingBottom: '12px',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: 'var(--orange)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'rgba(239, 101, 34, 0.2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                        }}
                      >
                        {index + 1}
                      </span>
                      {member.role}
                    </h3>
                    {index >= minMembers && (
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '16px',
                    }}
                  >
                    {/* Full Name */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Adithya Vardhan"
                        value={member.name}
                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'var(--white)', fontSize: '0.9rem', fontFamily: 'var(--font-body)', outline: 'none' }}
                      />
                    </div>

                    {/* Register Number */}
                    <div>
                      <label style={labelStyle}>
                        Register Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 312322104001"
                        pattern="[A-Za-z0-9\-]{4,20}"
                        title="4–20 letters, digits or hyphens"
                        value={member.registerNumber}
                        onChange={(e) => handleMemberChange(index, 'registerNumber', e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. name@vec.ac.in"
                        value={member.email}
                        onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'var(--white)', fontSize: '0.9rem', fontFamily: 'var(--font-body)', outline: 'none' }}
                      />
                    </div>

                    {/* Department */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        Department *
                      </label>
                      <select
                        required
                        value={member.department}
                        onChange={(e) => handleMemberChange(index, 'department', e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', background: '#0d0d0d', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: member.department ? 'var(--white)' : 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'var(--font-body)', outline: 'none' }}
                      >
                        <option value="" disabled>Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    {/* Year of Study */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        Year of Study *
                      </label>
                      <select
                        value={member.year}
                        onChange={(e) => handleMemberChange(index, 'year', e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', background: '#0d0d0d', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'var(--white)', fontSize: '0.9rem', fontFamily: 'var(--font-body)', outline: 'none' }}
                      >
                        {years.map((yr) => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>

                    {/* Phone Number */}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={member.phone}
                        onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'var(--white)', fontSize: '0.9rem', fontFamily: 'var(--font-body)', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional member button, up to the event's maximum team size */}
            {members.length < maxMembers && (
              <div style={{ marginBottom: '32px' }}>
                <button
                  type="button"
                  onClick={addMember}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(239, 101, 34, 0.08)',
                    border: '1px dashed rgba(239, 101, 34, 0.5)',
                    borderRadius: '14px',
                    color: 'var(--orange)',
                    fontSize: '0.92rem',
                    fontWeight: '600',
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 101, 34, 0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 101, 34, 0.08)'; }}
                >
                  <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>+</span> Add Member {members.length + 1} (max {maxMembers})
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '1rem',
                  borderRadius: '14px',
                  justifyContent: 'center',
                }}
              >
                {loading ? 'Processing Registration...' : `Complete Registration (${members.length} Member${members.length > 1 ? 's' : ''})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function RegisterStatus({ loading, message }) {
  return (
    <div className="register-page" style={{ paddingTop: '140px', minHeight: '100vh', paddingBottom: '80px', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>
            <div className="admin-login-spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px' }} />
            Loading registration...
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '24px' }}>{message}</p>
            <Link to="/events" className="btn-primary">Browse events</Link>
          </>
        )}
      </div>
    </div>
  );
}
