import { mercedesGlbHref, scheduleMercedesGlbPrefetch } from './models-prefetch-mercedes.js?v=1';

scheduleMercedesGlbPrefetch(mercedesGlbHref(import.meta.url));
