import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase client safely inside sitemap generator
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const BASE_URL = process.env.APP_URL || 'https://engelsizforum.com';

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
      .select('id, slug, created_at');

    if (catError) {
      console.error('[Sitemap Generator] Error fetching categories:', catError);
    } else if (categories) {
      categories.forEach((cat) => {
        const identifier = cat.slug || cat.id;
        if (identifier) {
          sitemapEntries.push({
            url: `${BASE_URL}/communities/${identifier}`,
            lastModified: cat.created_at ? new Date(cat.created_at) : currentDate,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });
    }

    // 3. Fetch recent Discussion Topics dynamically
    const { data: topics, error: topicError } = await supabase
      .from('topics')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(1000); // Limit to top 1000 topics for performance and sitemap limits

    if (topicError) {
      console.error('[Sitemap Generator] Error fetching topics:', topicError);
    } else if (topics) {
      topics.forEach((topic) => {
        if (topic.id) {
          sitemapEntries.push({
            url: `${BASE_URL}/discussions/${topic.id}`,
            lastModified: topic.created_at ? new Date(topic.created_at) : currentDate,
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
