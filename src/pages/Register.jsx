import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store } from '../data/store';
import { renderGlowLetters } from '../components/GlowText';

export default function Register() {
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState([
    {
      id: 1,
      role: 'Team Lead / Member 1',
      name: '',
      email: '',
      department: '',
      year: '1st Year',
      phone: '',
    },
  ]);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [settings, setSettings] = useState({
    registrationsOpen: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const s = await Store.getSettings();
      setSettings(s);
    };
    loadSettings();
  }, []);

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
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const addMember = () => {
    if (members.length >= 3) {
      alert('Maximum of 2 extra members (3 members total) allowed per team.');
      return;
    }
    const newMemberNumber = members.length + 1;
    setMembers([
      ...members,
      {
        id: Date.now(),
        role: `Member ${newMemberNumber}`,
        name: '',
        email: '',
        department: '',
        year: '1st Year',
        phone: '',
      },
    ]);
  };

  const removeMember = (index) => {
    if (members.length <= 1) return;
    const updated = members.filter((_, idx) => idx !== index);
    const renumbered = updated.map((m, idx) => ({
      ...m,
      role: idx === 0 ? 'Team Lead / Member 1' : `Member ${idx + 1}`,
    }));
    setMembers(renumbered);
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
        teamName: teamName.trim() || (members[0] && members[0].name ? `${members[0].name}'s Team` : 'Team Alpha'),
        members: members,
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
    setMembers([
      {
        id: 1,
        role: 'Team Lead / Member 1',
        name: '',
        email: '',
        department: '',
        year: '1st Year',
        phone: '',
      },
    ]);
  };

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
              Welcome to the VECODERS ecosystem! We have sent a confirmation email with onboarding details to{' '}
              <strong style={{ color: 'var(--orange)' }}>{members[0].email || 'your registered email'}</strong>.
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
                  If applying as an individual, you can leave this blank or provide a handle.
                </p>
              </div>
            </div>

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
                    {index > 0 && (
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

            {/* Additional Member Button (Max 2 extra members) */}
            {members.length < 3 && (
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
                  <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>+</span> Add Member {members.length + 1}
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
