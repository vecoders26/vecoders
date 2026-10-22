import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Store } from '../data/store';
import { useSettings } from '../data/settingsContext';

gsap.registerPlugin(ScrollTrigger);

function renderGlowLetters(text) {
  return text.split('').map((char, idx) => {
    if (char === ' ') {
      return ' ';
    }
    return (
      <span key={idx} className="hover-glow-letter">
        {char}
      </span>
    );
  });
}

export default function About() {
  const patronTrackRef = useRef(null);
  const [patrons, setPatrons] = useState([]);
  const {
    stats = [],
    aboutHeroLine1,
    aboutHeroLine2,
    aboutIntro,
    aboutBentoHeadline,
    aboutBentoSubline,
  } = useSettings();
  // Bento grid: one stat beside the headline, one on the second row, up to three in the trio.
  const [bentoTop, bentoLeft, ...bentoTrio] = stats;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      gsap.fromTo(
        '#aboutHeroTitle',
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 }
      );
      gsap.fromTo(
        '#aboutHeroDesc',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.6 }
      );
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    Store.getPatrons().then(setPatrons);
  }, []);

  // The stat slides come from the stats list in Sanity, so rebuild the pinned scroller
  // whenever it changes (it counts the slides when created).
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scroll-driven sticky stats
      const items = document.querySelectorAll('.about-stat-item, .about-stat-bento');
      const card = document.getElementById('aboutStatsCard');

      if (card && items.length > 0) {
        const totalItems = items.length;

        ScrollTrigger.create({
          trigger: '.about-stats-sticky',
          start: 'top top',
          end: 'bottom bottom',
          pin: card,
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const idx = Math.min(Math.floor(progress * totalItems), totalItems - 1);
            items.forEach((item, i) => {
              if (i === idx) {
                item.style.opacity = '1';
                item.style.transform = 'translate(-50%, -50%) translateY(0)';
              } else {
                item.style.opacity = '0';
                item.style.transform =
                  i < idx
                    ? 'translate(-50%, -50%) translateY(-50px)'
                    : 'translate(-50%, -50%) translateY(50px)';
              }
            });
          },
        });
      }
    });
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [stats]);

  // Patron cards start hidden in CSS and arrive after mount, so reveal them once loaded.
  useEffect(() => {
    if (!patrons.length) return;
    const ctx = gsap.context(() => {
      // Patron card reveal
      gsap.to('.about-patrons__card', {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about-patrons', start: 'top 85%' },
      });
    });
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [patrons]);

  const scrollPatrons = (direction) => {
    if (patronTrackRef.current) {
      const scrollAmount = 600;
      patronTrackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="about-page">
      {/* ========== ABOUT HERO ========== */}
      <section className="about-page-hero">
        <div className="about-page-hero__glow-tr" />
        <div className="about-page-hero__glow-tl" />

        <div className="about-page-hero__text">
          <h1 className="about-page-hero__title" id="aboutHeroTitle">
            <span className="about-title-line">
              {renderGlowLetters(aboutHeroLine1 || '')}
            </span>
            <span className="about-title-line">
              {renderGlowLetters(aboutHeroLine2 || '')}
            </span>
          </h1>
          <div className="about-page-hero__desc-wrap" id="aboutHeroDesc">
            <p className="about-page-hero__desc">
              {renderGlowLetters(aboutIntro || '')}
            </p>
          </div>
        </div>
      </section>

      {/* ========== SCROLL-DRIVEN STATS ========== */}
      <section className="about-stats-section">
        <div className="about-stats-section__inner">
          <div className="about-stats-sticky" style={{ height: `${Math.max(3, stats.length + 1) * 85}vh` }}>
            <div className="about-stats-sticky__card" id="aboutStatsCard">
              <div className="about-stats-sticky__glow-left" />
              <div className="about-stats-sticky__glow-right" />

              <div className="about-stats-sticky__content" id="aboutStatsContent">
                {/* Stat items cycled via GSAP */}
                {stats.map((stat, i) => (
                  <div className={`about-stat-item${i === 0 ? ' active' : ''}`} data-index={i} key={i}>
                    <h2>
                      {stat.value} {stat.label}
                    </h2>
                  </div>
                ))}

                {/* Final bento grid */}
                <div className="about-stat-bento" data-index={stats.length}>
                  <div className="about-stat-bento__row">
                    <div className="about-stat-bento__cell about-stat-bento__cell--wide">
                      <h2>{aboutBentoHeadline}</h2>
                      <p>{aboutBentoSubline}</p>
                    </div>
                    {bentoTop && (
                      <div className="about-stat-bento__cell">
                        <h2>{bentoTop.value}</h2>
                        <p>{bentoTop.label}</p>
                      </div>
                    )}
                  </div>
                  {bentoLeft && (
                    <div className="about-stat-bento__row">
                      <div className="about-stat-bento__cell">
                        <h2>{bentoLeft.value}</h2>
                        <p>{bentoLeft.label}</p>
                      </div>
                      {bentoTrio.length > 0 && (
                        <div className="about-stat-bento__cell about-stat-bento__cell--trio">
                          {bentoTrio.slice(0, 3).map((stat, i) => (
                            <div className="about-stat-bento__mini" key={i}>
                              <h3>{stat.value}</h3>
                              <p>{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== OUR PATRONS ========== */}
      <section className="about-patrons" id="aboutPatrons">
        <div className="container">
          <h2 className="about-patrons__title">OUR PATRONS</h2>
          <div className="about-patrons__scroll-area">
            <div className="about-patrons__track" id="patronTrack" ref={patronTrackRef}>
              {patrons.map((patron) => (
                <div className="about-patrons__card" key={patron.id}>
                  <div className="about-patrons__card-inner">
                    {patron.photo ? (
                      <img className="about-patrons__card-photo" src={patron.photo} alt="" loading="lazy" />
                    ) : (
                      <div className="about-patrons__card-gradient" />
                    )}
                    <div className="about-patrons__card-info">
                      <h3>{patron.name}</h3>
                      {patron.role && <p>{patron.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="about-patrons__nav">
              <button
                className="about-patrons__nav-btn"
                id="patronPrev"
                aria-label="Scroll left"
                onClick={() => scrollPatrons('left')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8L2 12L6 16" />
                  <path d="M2 12H22" />
                </svg>
              </button>
              <button
                className="about-patrons__nav-btn"
                id="patronNext"
                aria-label="Scroll right"
                onClick={() => scrollPatrons('right')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8L22 12L18 16" />
                  <path d="M2 12H22" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
