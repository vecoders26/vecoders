import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { renderGlowLetters } from '../components/GlowText';
import { Store } from '../data/store';

gsap.registerPlugin(ScrollTrigger);

// "#EF6522" -> "rgba(239, 101, 34, 0.25)" for the card's ambient glow.
function glowFrom(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '');
  if (!m) return 'rgba(239, 101, 34, 0.25)';
  const [r, g, b] = m.slice(1).map((h) => parseInt(h, 16));
  return `rgba(${r}, ${g}, ${b}, 0.25)`;
}

export default function Timeline() {
  const trackRef = useRef(null);
  const pinWrapRef = useRef(null);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    Store.getTimeline().then(setEntries);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero content fade-in
      gsap.fromTo(
        '#timelineHeroContent',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 }
      );
    });

    return () => ctx.revert();
  }, []);

  // The horizontal scroll measures the track width when created, so build it only after the
  // timeline entries from Sanity have rendered, and rebuild if they change.
  useEffect(() => {
    if (!entries.length) return;
    const ctx = gsap.context(() => {
      // Horizontal Timeline Scroll
      const track = trackRef.current;
      const pinWrap = pinWrapRef.current;

      if (track && pinWrap) {
        const totalWidth = track.scrollWidth - window.innerWidth;

        gsap.to(track, {
          x: -totalWidth,
          ease: 'none',
          scrollTrigger: {
            trigger: '#timelineScroll',
            pin: true,
            scrub: 1,
            end: () => '+=' + (totalWidth + 300),
            invalidateOnRefresh: true,
          },
        });

        // Timeline line progress
        gsap.fromTo(
          '#timelineLine',
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '#timelineScroll',
              start: 'top top',
              end: 'bottom bottom',
              scrub: true,
            },
          }
        );
      }
    });
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [entries]);

  return (
    <div className="timeline-page">
      {/* ========== TIMELINE HERO ========== */}
      <section className="timeline-hero" id="timelineHero">
        <svg className="timeline-hero__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M -5 50 C 25 0, 25 100, 50 50 C 75 0, 75 100, 105 50"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
          <circle cx="50" cy="50" r="0.8" fill="rgba(255, 255, 255, 0.6)" />
        </svg>

        <div className="timeline-hero__glow-bl" />
        <div className="timeline-hero__glow-br" />

        <div className="timeline-hero__content" id="timelineHeroContent">
          <div className="timeline-hero__title-wrap">
            <h1>
              {renderGlowLetters('VECODERS', 'glow-orange')}
            </h1>
            <p className="timeline-hero__subtitle" style={{ letterSpacing: '6px' }}>
              {renderGlowLetters('TIMELINE', 'glow-orange')}
            </p>
          </div>
        </div>
      </section>

      {/* ========== TIMELINE SCROLL ========== */}
      <section className="timeline-scroll" id="timelineScroll">
        <div className="timeline-scroll__pin-wrap" id="timelinePinWrap" ref={pinWrapRef}>
          <div className="timeline-scroll__track" id="timelineTrack" ref={trackRef}>
            {entries.map((item) => {
              const president = item.president || {};
              // Sanity image URLs are already encoded; local /public fallbacks contain spaces.
              const photo = president.photo?.startsWith('/') ? encodeURI(president.photo) : president.photo;
              return (
              <div className="timeline-scroll__year" data-year={item.year} key={item.id}>
                <div className="timeline-card" style={{ '--card-theme': item.themeColor }}>
                  <div
                    className="timeline-card__ambient-glow"
                    style={{ background: glowFrom(item.themeColor) }}
                  />

                  {/* Left Column: Milestone Narrative */}
                  <div className="timeline-card__content">
                    <div className="timeline-card__header">
                      <div className="timeline-card__year-badge">{item.year}</div>
                      <span className="timeline-card__role-pill">
                        {president.role}
                      </span>
                    </div>

                    <div className="timeline-card__text-block">
                      <h3 className="timeline-card__title">{item.title}</h3>
                      <p className="timeline-card__desc">{item.description}</p>
                    </div>

                    <div className="timeline-card__tags">
                      {(item.tags || []).map((tag, idx) => (
                        <span className="timeline-card__tag" key={idx}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: President Showcase */}
                  <div className="timeline-card__leader">
                    <div className="timeline-leader__frame">
                      <div
                        className="timeline-leader__glow"
                        style={{ background: glowFrom(item.themeColor) }}
                      />
                      {photo && (
                        <img
                          src={photo}
                          alt={`${president.name} - ${president.title}`}
                          className="timeline-leader__img"
                          loading="lazy"
                        />
                      )}
                      <div className="timeline-leader__gradient-overlay" />
                      <div className="timeline-leader__info">
                        <span className="timeline-leader__badge">
                          {president.role}
                        </span>
                        <h4 className="timeline-leader__name">{president.name}</h4>
                        <p className="timeline-leader__title">{president.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Dashed line */}
        <div className="timeline-scroll__line" id="timelineLine" />
      </section>
    </div>
  );
}
