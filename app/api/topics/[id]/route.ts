import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;

    // Fetch topic
    const { data: topic, error: topicError } = await supabaseAdmin
      .from('topics')
      .select(`
        *,
        author:profiles(full_name, avatar_url),
        categories(name, color)
      `)
      .eq('id', id)
      .single();

    if (topicError) throw topicError;

    // Fetch comments
    const { data: comments, error: commentsError } = await supabaseAdmin
      .from('comments')
      .select(`
        *,
        author:profiles(full_name, avatar_url)
      `)
      .eq('topic_id', id)
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;

    return NextResponse.json({ 
      topic,
      comments
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
