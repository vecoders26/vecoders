import React, { useState, useEffect } from 'react';
import { Store } from '../data/store';
import { renderGlowLetters } from '../components/GlowText';

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    const data = await Store.getBlogs();
    setBlogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="blogs-page">
      {/* ========== BLOGS HERO ========== */}
      <section className="blogs-page-hero">
        <div className="blogs-page-hero__glow-tr" />
        <div className="blogs-page-hero__glow-tl" />
        <div className="blogs-page-hero__title-wrap" id="blogsHeroTitle">
          <h1>
            {renderGlowLetters('VECODERS', 'glow-emerald')}
          </h1>
          <h2 style={{ letterSpacing: '6px' }}>
            {renderGlowLetters('BLOGS', 'glow-emerald')}
          </h2>
        </div>
      </section>

      {/* ========== BLOGS GRID ========== */}
      <section className="blogs-page-content">
        <div className="container">
          <h2 className="blogs-page__section-title">
            {renderGlowLetters('Our Stories & Insights', 'glow-emerald')}
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div className="admin-login-spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px' }} />
              Loading articles...
            </div>
          ) : (
            <div className="blogs-page__grid" id="blogsGrid">
              {blogs.map((b) => (
                <div className="blogs-page__card" key={b.id}>
                  <div className="blogs-page__card-inner">
                    <div className="blogs-page__card-spine" />
                    <div className="blogs-page__card-front">
                      <img src={b.image} alt={b.title} />
                      <span className="blogs-page__card-front-title">{b.title}</span>
                      <div className="blogs-page__card-front-fade" />
                    </div>
                    <div className="blogs-page__card-back">
                      <div className="blogs-page__card-back-inner">
                        <h4>{b.title}</h4>
                        <p>
                          {b.desc}{' '}
                          <span className="blogs-page__card-readmore">...Read More</span>
                        </p>
                        <div className="blogs-page__card-meta-tags">
                          <span>{b.date}</span>
                          <span>{b.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
