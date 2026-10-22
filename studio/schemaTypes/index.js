import { blog } from './blog';
import { event } from './event';
import { achievement } from './achievement';
import { siteSettings } from './siteSettings';
import { registration } from './registration';
import { faq } from './faq';
import { patron } from './patron';
import { timelineEntry } from './timelineEntry';

export const SINGLETON_TYPES = ['siteSettings'];

export const contentSchemaTypes = [siteSettings, blog, event, achievement, timelineEntry, patron, faq];
export const registrationSchemaTypes = [registration];
