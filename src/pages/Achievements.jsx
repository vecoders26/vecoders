import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store } from '../data/store';
import { renderGlowLetters } from '../components/GlowText';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    const data = await Store.getAchievements();
    setAchievements(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  return (
    <div className="achievements-page">
      {/* ========== ACHIEVEMENTS HERO ========== */}
      <section className="blogs-page-hero">
        <div className="blogs-page-hero__glow-tr" />
        <div className="blogs-page-hero__glow-tl" />
        <div className="blogs-page-hero__title-wrap" id="blogsHeroTitle">
          <h1>
            {renderGlowLetters('VECODERS', 'glow-purple')}
          </h1>
          <h2 style={{ letterSpacing: '6px' }}>
            {renderGlowLetters('ACHIEVEMENTS', 'glow-purple')}
          </h2>
        </div>
      </section>

      {/* ========== ACHIEVEMENTS CONTENT ========== */}
      <section className="blogs-page-content" style={{ minHeight: '60vh' }}>
        <div className="container">
          <h2 className="blogs-page__section-title">
            {renderGlowLetters('Our Milestones & Accolades', 'glow-purple')}
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div className="admin-login-spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px' }} />
              Loading achievements...
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px',
                marginTop: '40px',
              }}
            >
              {achievements.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    padding: '30px 24px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.3s, border-color 0.3s',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '50px',
                      background: 'rgba(239, 101, 34, 0.12)',
                      color: 'var(--orange)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      marginBottom: '16px',
                    }}
                  >
                    {item.badge}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.2rem',
                      color: 'var(--cream)',
                      marginBottom: '10px',
                      lineHeight: '1.4',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      marginBottom: '20px',
                    }}
                  >
                    {item.desc}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingTop: '14px',
                    }}
                  >
                    <span>{item.category}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <Link to="/events" className="btn-primary">
              Join Our Next Challenge
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
