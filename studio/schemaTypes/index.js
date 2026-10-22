import { blog } from './blog';
import { event } from './event';
import { achievement } from './achievement';
import { siteSettings } from './siteSettings';
import { registration } from './registration';

export const SINGLETON_TYPES = ['siteSettings'];

export const contentSchemaTypes = [siteSettings, blog, event, achievement];
export const registrationSchemaTypes = [registration];
