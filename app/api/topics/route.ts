import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category_id');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabaseAdmin
      .from('topics')
      .select(`
        *,
        author:profiles(full_name, avatar_url),
        categories(name, color),
        reactions_count:reactions(count),
        comments_count:comments(count)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ topics: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
