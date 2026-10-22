// The site's original hardcoded content. Two uses:
//  - fallback when Sanity can't be reached (the site still renders fully), and
//  - the source for scripts/seed-content.mjs, which uploads it as the starting data.
// After seeding, edit content in Sanity Studio, not here.

export const DEFAULT_SETTINGS = {
  announcementActive: false,
  announcementText: '',
  registrationsOpen: true,
  maintenanceMode: false,

  stats: [
    { value: '5+', label: 'Years' },
    { value: '500+', label: 'Members' },
    { value: '120+', label: 'Projects' },
    { value: '25+', label: 'Hackathons' },
    { value: '80+', label: 'Workshops' },
    { value: '50+', label: 'Achievements' },
  ],

  legacyTitle: 'Our Legacy',
  legacyDescription:
    'From humble beginnings to becoming a beacon of innovation and excellence, our journey is woven with passion, perseverance, and purpose. Over the years, each generation has carried forward the torch — enriching traditions, embracing change, and inspiring new milestones.',

  aboutHeroLine1: 'SINCE',
  aboutHeroLine2: '2023',
  aboutIntro:
    "Established in 2022 at Valliammai Engineering College, VECODERS emerged as a visionary initiative spearheaded by a cohort of passionate technophiles intent on redefining what a student tech community could achieve. What began as a quest for innovation and collaboration has since blossomed into one of the college's foremost student-driven platforms, nurturing creativity, critical thinking, and tangible real-world impact. Today, VECODERS continues to inspire the innovators of tomorrow through hands-on workshops, hackathons, and strategic alliances with industry leaders.",
  aboutBentoHeadline: 'Events, Workshops, Tech Talks,',
  aboutBentoSubline: 'Initiatives and much more...',

  contactEmail: 'vecoders@vec.ac.in',
  addressLines: ['Valliammai Engineering College', 'Kattankulathur, Chennai'],
  socialLinks: {
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    x: 'https://twitter.com',
  },
};

export const DEFAULT_FAQS = [
  {
    question: 'What is VECODERS?',
    answer:
      'VECODERS is the official technical club of Valliammai Engineering College, dedicated to fostering innovation, technical excellence, and collaborative learning among students across all engineering disciplines.',
  },
  {
    question: 'Who can join VECODERS?',
    answer:
      'Any student from Valliammai Engineering College can join, regardless of year or department. From web development and AI to cybersecurity and design — there is a domain for everyone.',
  },
  {
    question: 'What kind of events does VECODERS organize?',
    answer:
      'We organize hackathons, coding competitions, workshops, tech talks, project showcases, and inter-college events covering AI/ML, full-stack development, cloud computing, UI/UX design, and more.',
  },
  {
    question: 'How do I register?',
    answer:
      'Click the "Register" button at the top of the page to fill out our membership form. You will receive a confirmation email with details about upcoming events, domain selection, and your onboarding session.',
  },
  {
    question: 'Is there any membership fee?',
    answer:
      'VECODERS operates on a minimal membership model. The annual fee is nominal and ensures access to all workshops, mentorship sessions, project teams, and exclusive events throughout the year.',
  },
  {
    question: 'What domains does VECODERS cover?',
    answer:
      'Web Development, Mobile Development, AI & Machine Learning, Cybersecurity, Cloud & DevOps, UI/UX Design, Competitive Programming, and IoT & Embedded Systems.',
  },
  {
    question: 'Can I participate in multiple domain teams?',
    answer:
      'Yes! We encourage cross-domain exploration. You can be part of multiple teams and contribute to projects across different technology domains simultaneously.',
  },
  {
    question: 'What is the last date for registration?',
    answer:
      'Registration is open year-round. However, early registration gives you priority access to workshops, mentorship programs, and project team placements.',
  },
].map((f, i) => ({ id: `faq-${i + 1}`, order: (i + 1) * 10, ...f }));

export const DEFAULT_PATRONS = [
  { name: 'Dr. Principal', role: 'Chief Patron, Principal' },
  { name: 'Dr. HOD IT', role: 'Head of Department, IT' },
  { name: 'Prof. Faculty Advisor', role: 'Faculty Coordinator — VECODERS' },
  { name: 'Prof. Mentor', role: 'Technical Mentor' },
].map((p, i) => ({ id: `patron-${i + 1}`, order: (i + 1) * 10, photo: null, ...p }));

// `photo` here is a /public path; the seed script uploads it to Sanity.
export const DEFAULT_TIMELINE = [
  {
    year: '2026',
    title: 'The Apex Year',
    description:
      "Under the leadership of Current President Abishek.R, VECODERS scales to unprecedented heights with national-level hackathons, 36+ active members, enterprise alliances, and a fully revamped digital ecosystem. Code Arena stands as the college's marquee tech battleground.",
    themeColor: '#EF6522',
    president: { name: 'Abishek.R', role: 'Current President', title: 'Current President of VECODERS', photo: '/current president.png' },
    tags: ['Current Leadership', '500+ Members', 'National Hackathons', 'Code Arena'],
  },
  {
    year: '2025',
    title: 'Scaling Innovation',
    description:
      'Spearheaded by Third President Sanjaikumar K, VECODERS launched the specialized AI/ML vertical, hosted premier inter-college hackathons with 30+ teams, and established cutting-edge cloud computing workshops with industry alliances.',
    themeColor: '#06b6d4',
    president: { name: 'Sanjaikumar K', role: 'Third President', title: '3rd President of VECODERS', photo: '/thirdpresident.jpeg' },
    tags: ['Third President', 'AI/ML Vertical', 'Inter-College Hackathons', 'Cloud Workshops'],
  },
  {
    year: '2024',
    title: 'Building Momentum',
    description:
      'Under the tenure of Second President Kogulmurugaiah, the official web portal was born and domain-based specialization teams were introduced across Web Dev, AI, Cybersecurity, and Design, growing the community to 20+ active developers.',
    themeColor: '#10b981',
    president: { name: 'Kogulmurugaiah', role: 'Second President', title: '2nd President of VECODERS', photo: '/second president.png' },
    tags: ['Second President', 'Domain Teams', 'Web Platform', '200+ Coders'],
  },
  {
    year: '2023',
    title: 'The First Spark',
    description:
      'Founded and ignited under First President Vasanthakumar.VK, VECODERS took its historic initial steps: launching foundational bootcamps, creating the official GitHub organization, and onboarding the pioneering cohort of 80 tech enthusiasts.',
    themeColor: '#a855f7',
    president: { name: 'Vasanthakumar.VK', role: 'First President', title: '1st President of VECODERS', photo: '/first president.jpeg' },
    tags: ['First President', 'Foundation & Ignition', 'GitHub Org', '80 Pioneers'],
  },
].map((t) => ({ id: `timeline-${t.year}`, ...t }));
