import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Store } from '../data/store';
import BlogMeta from '../components/BlogMeta';

export default function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    let cancelled = false;
    setBlog(undefined);
    Store.getBlogBySlug(slug).then((b) => {
      if (!cancelled) setBlog(b);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (blog === undefined) {
    return (
      <div className="blog-post" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="admin-login-spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px' }} />
        Loading article...
      </div>
    );
  }

  if (blog === null) {
    return (
      <div className="blog-post container" style={{ textAlign: 'center' }}>
        <h1 className="blog-post__title">Article not found</h1>
        <Link to="/blog" className="btn-primary">Back to blog</Link>
      </div>
    );
  }

  return (
    <article className="blog-post">
      <div className="container blog-post__container">
        <Link to="/blog" className="blog-post__back">← All stories</Link>

        <header className="blog-post__header">
          <h1 className="blog-post__title">{blog.title}</h1>
          {blog.desc && <p className="blog-post__lead">{blog.desc}</p>}
          <BlogMeta blog={blog} />
        </header>

        {blog.image && <img className="blog-post__image" src={blog.image} alt="" />}

        {blog.content && <div className="blog-post__content">{blog.content}</div>}

        <div className="blog-post__footer">
          <Link to="/blog" className="btn-outline">← Back to all stories</Link>
        </div>
      </div>
    </article>
  );
}
