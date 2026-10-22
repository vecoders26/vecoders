import React from 'react';

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

// Post metadata, each piece styled differently: category as an accent pill, author as a
// byline with an initial avatar, read time and date as quiet icon rows.
// `compact` (blog cards) drops the author and shrinks everything.
export default function BlogMeta({ blog, compact = false }) {
  const initial = blog.author?.trim()?.[0]?.toUpperCase();
  return (
    <div className={`blog-meta${compact ? ' blog-meta--compact' : ''}`}>
      {!compact && blog.author && (
        <span className="blog-meta__author">
          <span className="blog-meta__avatar" aria-hidden="true">{initial}</span>
          <span>
            <span className="blog-meta__label">Written by</span>
            <span className="blog-meta__author-name">{blog.author}</span>
          </span>
        </span>
      )}
      {blog.category && <span className="blog-meta__category">{blog.category}</span>}
      {blog.readTime && (
        <span className="blog-meta__item">
          <ClockIcon /> {blog.readTime}
        </span>
      )}
      {blog.date && (
        <span className="blog-meta__item">
          <CalendarIcon /> {blog.date}
        </span>
      )}
    </div>
  );
}
