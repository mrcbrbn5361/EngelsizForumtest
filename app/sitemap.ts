import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase client safely inside sitemap generator
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const BASE_URL = process.env.APP_URL || 'https://engelsizforum.com';

function parseSafeDate(dateVal: any, fallbackDate: Date): Date {
  if (!dateVal) return fallbackDate;
  const parsed = new Date(dateVal);
  return isNaN(parsed.getTime()) ? fallbackDate : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  // 1. Core static pages of EngelsizForum
  const staticPages = [
    { route: '', changefreq: 'daily', priority: 1.0 },
    { route: '/discussions', changefreq: 'always', priority: 0.9 },
    { route: '/discussions/new', changefreq: 'weekly', priority: 0.7 },
    { route: '/communities', changefreq: 'weekly', priority: 0.8 },
    { route: '/about', changefreq: 'monthly', priority: 0.6 },
    { route: '/help', changefreq: 'monthly', priority: 0.5 },
    { route: '/security', changefreq: 'monthly', priority: 0.4 },
    { route: '/privacy', changefreq: 'monthly', priority: 0.3 },
    { route: '/terms', changefreq: 'monthly', priority: 0.3 },
    { route: '/accessibility', changefreq: 'monthly', priority: 0.5 },
    { route: '/visitor-stats', changefreq: 'daily', priority: 0.7 },
    { route: '/login', changefreq: 'monthly', priority: 0.5 },
    { route: '/register', changefreq: 'monthly', priority: 0.5 },
    { route: '/search', changefreq: 'daily', priority: 0.6 },
    { route: '/messages', changefreq: 'daily', priority: 0.4 },
    { route: '/profile', changefreq: 'weekly', priority: 0.5 },
    { route: '/auth/forgot-password', changefreq: 'monthly', priority: 0.4 },
    { route: '/auth/reset-password', changefreq: 'monthly', priority: 0.4 },
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${BASE_URL}${page.route}`,
    lastModified: currentDate,
    changeFrequency: page.changefreq as any,
    priority: page.priority,
  }));

  // If Supabase is not configured, fallback gracefully to static pages
  if (!supabase) {
    console.warn('[Sitemap Generator] Supabase variables missing. Serving static pages only.');
    return sitemapEntries;
  }

  try {
    // 2. Fetch all Communities/Categories dynamically
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');

    if (catError) {
      console.error('[Sitemap Generator] Error fetching categories:', catError);
    } else if (categories && Array.isArray(categories)) {
      categories.forEach((cat: any) => {
        const identifier = cat.slug || cat.id;
        if (identifier) {
          sitemapEntries.push({
            url: `${BASE_URL}/communities/${identifier}`,
            lastModified: parseSafeDate(cat.updated_at || cat.created_at, currentDate),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });
    }

    // 3. Fetch recent Discussion Topics dynamically
    let { data: topics, error: topicError } = await supabase
      .from('topics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (topicError) {
      // Fallback if created_at column ordering fails
      const retry = await supabase.from('topics').select('*').limit(1000);
      topics = retry.data;
      topicError = retry.error;
    }

    if (topicError) {
      console.error('[Sitemap Generator] Error fetching topics:', topicError);
    } else if (topics && Array.isArray(topics)) {
      topics.forEach((topic: any) => {
        if (topic.id) {
          sitemapEntries.push({
            url: `${BASE_URL}/discussions/${topic.id}`,
            lastModified: parseSafeDate(topic.updated_at || topic.created_at, currentDate),
            changeFrequency: 'daily',
            priority: 0.8,
          });
        }
      });
    }
  } catch (error) {
    console.error('[Sitemap Generator] Unexpected error fetching database routes:', error);
  }

  return sitemapEntries;
}
