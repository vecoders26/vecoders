import { sanity } from './sanityClient';

// GROQ projections return the camelCase shape the pages already use.
const IMAGE = 'coalesce(image.asset->url + "?w=1200&auto=format", imageUrl)';

const BLOGS_QUERY = `*[_type == "blog" && defined(slug.current)] | order(publishedAt desc){
  "id": _id, title, desc, content, author, category, readTime, featured, publishedAt,
  "image": ${IMAGE}
}`;

// sheetId/sheetUrl are deliberately never projected: the sheet holds participants' details.
const EVENT_FIELDS = `
  "id": _id, "slug": slug.current, name, edition, domain, domainLabel, category, isLive,
  startDate, dateDisplay, timeDisplay, location, mode, pricePool, entryFee,
  badge, tagline, bannerGradient, icon, description, rules,
  "minTeamSize": coalesce(minTeamSize, 1), "maxTeamSize": coalesce(maxTeamSize, 3),
  "registrationOpen": isLive == true && registrationOpen != false,
  "image": ${IMAGE}
`;

const EVENTS_QUERY = `*[_type == "event" && defined(slug.current)] | order(coalesce(startDate, _createdAt) desc){${EVENT_FIELDS}}`;

const EVENT_BY_SLUG_QUERY = `*[_type == "event" && slug.current == $slug][0]{${EVENT_FIELDS}}`;

// Newest first, so /register lands on the latest open event.
const OPEN_EVENTS_QUERY = `*[_type == "event" && defined(slug.current) && isLive == true && registrationOpen != false]
  | order(coalesce(startDate, _createdAt) desc){${EVENT_FIELDS}}`;

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

  async getEventBySlug(slug) {
    try {
      return await sanity.fetch(EVENT_BY_SLUG_QUERY, { slug });
    } catch (error) {
      console.error('getEventBySlug error:', error);
      return null;
    }
  },

  getOpenEvents() {
    return fetchList(OPEN_EVENTS_QUERY, 'getOpenEvents');
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
    const body = await res.json().catch(() => null);
    if (!res.ok || !body) {
      throw new Error(body?.error || `Registration service unreachable (HTTP ${res.status}). Please try again later.`);
    }
    return body;
  },
};

// "Solo", "2 members", "1–3 members"
export function teamSizeLabel({ minTeamSize = 1, maxTeamSize = 3 } = {}) {
  if (maxTeamSize <= 1) return 'Solo';
  if (minTeamSize === maxTeamSize) return `${maxTeamSize} members`;
  return `${minTeamSize}–${maxTeamSize} members`;
}
