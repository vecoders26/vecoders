import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Store } from '../data/store';
import { renderGlowLetters } from '../components/GlowText';

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openBlog, setOpenBlog] = useState(null);
  const closeBlog = useCallback(() => setOpenBlog(null), []);

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
                <div
                  className="blogs-page__card"
                  key={b.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Read ${b.title}`}
                  onClick={() => setOpenBlog(b)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setOpenBlog(b);
                    }
                  }}
                >
                  <div className="blogs-page__card-inner">
                    <div className="blogs-page__card-spine" />
                    <div className="blogs-page__card-front">
                      <img src={b.image} alt={b.title} />
                      <span className="blogs-page__card-front-title">{b.title}</span>
                      <div className="blogs-page__card-front-fade" />
                    </div>
                    <div className="blogs-page__card-back" style={{ '--blog-bg': `url('${b.image}')` }}>
                      <div className="blogs-page__card-back-inner">
                        <h4>{b.title}</h4>
                        <p>{b.desc}</p>
                        <span className="blogs-page__card-readmore">Click to read →</span>
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

      {openBlog && <BlogReader blog={openBlog} onClose={closeBlog} />}
    </div>
  );
}

// Large, readable view of one post. Closes on Esc, the ✕ button, or a click on the backdrop.
function BlogReader({ blog, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const meta = [blog.author, blog.category, blog.readTime, blog.date].filter(Boolean);

  return (
    <div className="blog-reader" onClick={onClose}>
      <article
        className="blog-reader__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="blogReaderTitle"
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} className="blog-reader__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        {blog.image && <img className="blog-reader__image" src={blog.image} alt="" />}
        <div className="blog-reader__body">
          {meta.length > 0 && (
            <div className="blogs-page__card-meta-tags">
              {meta.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          )}
          <h2 id="blogReaderTitle" className="blog-reader__title">{blog.title}</h2>
          {blog.desc && <p className="blog-reader__desc">{blog.desc}</p>}
          {blog.content && <div className="blog-reader__content">{blog.content}</div>}
        </div>
      </article>
    </div>
  );
}
