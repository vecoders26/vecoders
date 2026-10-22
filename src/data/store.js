import { sanity } from './sanityClient';
import { DEFAULT_FAQS, DEFAULT_PATRONS, DEFAULT_SETTINGS, DEFAULT_TIMELINE } from './defaults';

// GROQ projections return the camelCase shape the pages already use.
const IMAGE = 'coalesce(image.asset->url + "?w=1200&auto=format", imageUrl)';

const BLOG_FIELDS = `
  "id": _id, "slug": slug.current, title, desc, content, author, category, readTime, featured, publishedAt,
  "image": ${IMAGE}
`;

const BLOGS_QUERY = `*[_type == "blog" && defined(slug.current)] | order(publishedAt desc){${BLOG_FIELDS}}`;

const BLOG_BY_SLUG_QUERY = `*[_type == "blog" && slug.current == $slug][0]{${BLOG_FIELDS}}`;

function withDisplayDate(b) {
  const published = b.publishedAt ? new Date(b.publishedAt) : null;
  return {
    ...b,
    date: published?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || '',
    time: published?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || '',
  };
}

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
  "stats": stats[]{value, label},
  legacyTitle, legacyDescription,
  aboutHeroLine1, aboutHeroLine2, aboutIntro, aboutBentoHeadline, aboutBentoSubline,
  contactEmail, addressLines, socialLinks
}`;

const FAQS_QUERY = `*[_type == "faq"] | order(coalesce(order, 999) asc, _createdAt asc){
  "id": _id, question, answer
}`;

const PATRONS_QUERY = `*[_type == "patron"] | order(coalesce(order, 999) asc, _createdAt asc){
  "id": _id, name, role, "photo": photo.asset->url + "?w=600&auto=format"
}`;

const TIMELINE_QUERY = `*[_type == "timelineEntry"] | order(year desc){
  "id": _id, year, title, description, themeColor, tags,
  president{name, role, title, "photo": photo.asset->url + "?w=800&auto=format"}
}`;

async function fetchList(query, label) {
  return (await fetchListOr(query, label, [])) || [];
}

// Like fetchList, but falls back to the original hardcoded content if Sanity is unreachable.
// An empty result is respected: if editors delete every FAQ, the section is empty.
async function fetchListOr(query, label, fallback) {
  try {
    return (await sanity.fetch(query)) || [];
  } catch (error) {
    console.error(`${label} error:`, error);
    return fallback;
  }
}

export const Store = {
  async getBlogs() {
    const blogs = await fetchList(BLOGS_QUERY, 'getBlogs');
    return blogs.map(withDisplayDate);
  },

  async getBlogBySlug(slug) {
    try {
      const blog = await sanity.fetch(BLOG_BY_SLUG_QUERY, { slug });
      return blog ? withDisplayDate(blog) : null;
    } catch (error) {
      console.error('getBlogBySlug error:', error);
      return null;
    }
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

  getFaqs() {
    return fetchListOr(FAQS_QUERY, 'getFaqs', DEFAULT_FAQS);
  },

  getPatrons() {
    return fetchListOr(PATRONS_QUERY, 'getPatrons', DEFAULT_PATRONS);
  },

  getTimeline() {
    return fetchListOr(TIMELINE_QUERY, 'getTimeline', DEFAULT_TIMELINE);
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
