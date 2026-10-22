import { sanity } from './sanityClient';

// GROQ projections return the camelCase shape the pages already use.
const IMAGE = 'coalesce(image.asset->url + "?w=1200&auto=format", imageUrl)';

const BLOGS_QUERY = `*[_type == "blog" && defined(slug.current)] | order(publishedAt desc){
  "id": _id, title, desc, content, author, category, readTime, featured, publishedAt,
  "image": ${IMAGE}
}`;

const EVENTS_QUERY = `*[_type == "event"] | order(coalesce(startDate, _createdAt) desc){
  "id": _id, "slug": slug.current, name, edition, domain, domainLabel, category, isLive,
  startDate, dateDisplay, timeDisplay, location, mode, teamSize, pricePool, entryFee,
  badge, tagline, bannerGradient, icon,
  "image": ${IMAGE}
}`;

const ACHIEVEMENTS_QUERY = `*[_type == "achievement"] | order(_createdAt desc){
  "id": _id, title, category, desc, date, badge
}`;

const SETTINGS_QUERY = `*[_id == "siteSettings"][0]{
  announcementActive, announcementText, registrationsOpen, maintenanceMode,
  totalMembersCount, totalProjectsCount, totalHackathonsCount, totalWorkshopsCount
}`;

const DEFAULT_SETTINGS = {
  announcementActive: false,
  announcementText: '',
  registrationsOpen: true,
  maintenanceMode: false,
  totalMembersCount: '500+',
  totalProjectsCount: '120+',
  totalHackathonsCount: '25+',
  totalWorkshopsCount: '80+',
};

async function fetchList(query, label) {
  try {
    return (await sanity.fetch(query)) || [];
  } catch (error) {
    console.error(`${label} error:`, error);
    return [];
  }
}

export const Store = {
  async getBlogs() {
    const blogs = await fetchList(BLOGS_QUERY, 'getBlogs');
    return blogs.map((b) => {
      const published = b.publishedAt ? new Date(b.publishedAt) : null;
      return {
        ...b,
        date: published?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || '',
        time: published?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || '',
      };
    });
  },

  getEvents() {
    return fetchList(EVENTS_QUERY, 'getEvents');
  },

  getAchievements() {
    return fetchList(ACHIEVEMENTS_QUERY, 'getAchievements');
  },

  async getSettings() {
    try {
      const settings = await sanity.fetch(SETTINGS_QUERY);
      // Drop nulls so unset fields fall back to defaults
      const defined = Object.fromEntries(Object.entries(settings || {}).filter(([, v]) => v != null));
      return { ...DEFAULT_SETTINGS, ...defined };
    } catch (error) {
      console.warn('getSettings error:', error);
      return DEFAULT_SETTINGS;
    }
  },

  // Writes go through the serverless function, which holds the Sanity token.
  // Resolves to { id } on success; throws with a user-facing message otherwise.
  async addRegistration(registration) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registration),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'Registration failed. Please try again.');
    return body;
  },
};
