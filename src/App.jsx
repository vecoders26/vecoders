import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NoiseOverlay from './components/NoiseOverlay';
import ScrollToTop from './components/ScrollToTop';
import useLenis from './hooks/useLenis';
import { Store } from './data/store';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Blog from './pages/Blog';
import Timeline from './pages/Timeline';
import Achievements from './pages/Achievements';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';
import BlogPost from './pages/BlogPost';
import { env } from './lib/env';
import { DEFAULT_SETTINGS } from './data/defaults';
import { SettingsContext } from './data/settingsContext';

export default function App() {
  useLenis();

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const s = await Store.getSettings();
      setSettings(s);
    };
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
    <div className="app-root">
      <ScrollToTop />
      <NoiseOverlay />

      {settings.announcementActive && !bannerDismissed && (
        <div className="site-announcement-banner">
          <span>{settings.announcementText}</span>
          <button
            className="site-announcement-banner__close"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}

      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:slug" element={<EventDetails />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/:slug" element={<Register />} />
          <Route path="/studio/*" element={<StudioRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
    </SettingsContext.Provider>
  );
}

// Content is managed in the hosted Sanity Studio. In production vercel.json redirects
// /studio before the app loads; this covers `npm run dev` and in-app navigation.
function StudioRedirect() {
  useEffect(() => {
    window.location.replace(env.studioUrl);
  }, []);
  return null;
}
