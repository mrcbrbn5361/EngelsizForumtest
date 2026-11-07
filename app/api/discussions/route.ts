import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Public REST API: GET /api/discussions
 * EngelsizForum Açık Topluluk Tartışmaları Beslemesi
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const category = searchParams.get('category');
  const search = searchParams.get('q');

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('topics')
        .select(`
          id, title, content, is_pinned, is_locked, is_solved,
          views_count, comments_count, created_at, updated_at, slug,
          author:profiles(id, username, role, avatar_url),
          category:categories(name, slug)
        `, { count: 'exact' });

      if (category) {
        query = query.eq('category.slug', category);
      }

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, count, error } = await query
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          status: 'success',
          meta: {
            page,
            limit,
            total: count || data.length,
            has_more: (count ? to < count - 1 : false),
          },
          discussions: data.map(item => ({
            id: item.id,
            title: item.title,
            excerpt: item.content ? item.content.slice(0, 200).replace(/<[^>]*>/g, '') : '',
            slug: item.slug,
            views_count: item.views_count || 0,
            replies_count: item.comments_count || 0,
            is_pinned: !!item.is_pinned,
            is_solved: !!item.is_solved,
            author: item.author || { username: 'Topluluk Üyesi', role: 'member' },
            category: item.category || { name: 'Genel', slug: 'genel' },
            created_at: item.created_at,
            url: `https://www.engelsizforum.com/discussions/${item.id}`,
          }))
        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
          }
        });
      }
    }

    return NextResponse.json({
      status: 'success',
      meta: {
        page,
        limit,
        total: 0,
        has_more: false,
      },
      discussions: []
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60'
      }
    });

  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err.message || 'Tartışmalar getirilemedi'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
