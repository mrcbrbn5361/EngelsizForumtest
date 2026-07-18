import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyMastodonRequest } from '@/lib/mastodon-auth';
import { mapTopicToStatus, mapCommentToStatus } from '@/lib/mastodon-mappers';

/**
 * Mastodon API: POST /api/v1/statuses
 * Creates a new status (a topic) or a reply (a comment) in EngelsizForum.
 */
export async function POST(req: NextRequest) {
  const host = req.headers.get('host') || 'engelsizforum.com';
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    // 1. Authenticate user
    const profile = await verifyMastodonRequest(req);
    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let statusText = '';
    let inReplyToId: string | null = null;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      statusText = body.status || '';
      inReplyToId = body.in_reply_to_id || null;
    } else {
      const formData = await req.formData();
      statusText = (formData.get('status') as string) || '';
      inReplyToId = (formData.get('in_reply_to_id') as string) || null;
    }

    if (!statusText.trim()) {
      return NextResponse.json({ error: 'Validation failed: Status content is empty.' }, { status: 422 });
    }

    // 2. Handle reply (Comment)
    if (inReplyToId) {
      // Check if replying to a topic
      const { data: topic } = await supabaseServer
        .from('topics')
        .select('*')
        .eq('id', inReplyToId)
        .maybeSingle();

      if (topic) {
        // Create comment
        const { data: newComment, error: commentErr } = await supabaseServer
          .from('comments')
          .insert({
            topic_id: inReplyToId,
            author_id: profile.id,
            content: statusText
          })
          .select('*')
          .single();

        if (commentErr) {
          console.error('Error inserting comment via Mastodon API:', commentErr);
          return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
        }

        // Increment comments_count in topic
        await supabaseServer.rpc('increment_comments_count', { topic_id: inReplyToId });

        const mapped = mapCommentToStatus(newComment, profile, topic, baseUrl);
        return new NextResponse(JSON.stringify(mapped), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      }

      // Check if replying to a comment (sub-comment)
      const { data: parentComment } = await supabaseServer
        .from('comments')
        .select('*')
        .eq('id', inReplyToId)
        .maybeSingle();

      if (parentComment) {
        // Create reply comment
        const { data: newComment, error: commentErr } = await supabaseServer
          .from('comments')
          .insert({
            topic_id: parentComment.topic_id,
            author_id: profile.id,
            parent_id: inReplyToId,
            content: statusText
          })
          .select('*')
          .single();

        if (commentErr) {
          console.error('Error inserting sub-comment via Mastodon API:', commentErr);
          return NextResponse.json({ error: 'Failed to create comment reply' }, { status: 500 });
        }

        // Increment comments_count in topic
        await supabaseServer.rpc('increment_comments_count', { topic_id: parentComment.topic_id });

        const { data: mainTopic } = await supabaseServer
          .from('topics')
          .select('*')
          .eq('id', parentComment.topic_id)
          .single();

        const mapped = mapCommentToStatus(newComment, profile, mainTopic, baseUrl);
        return new NextResponse(JSON.stringify(mapped), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      }

      return NextResponse.json({ error: 'in_reply_to_id not found' }, { status: 404 });
    }

    // 3. Handle new Topic
    // Fetch first category available
    const { data: categories } = await supabaseServer
      .from('categories')
      .select('id')
      .limit(1);

    let categoryId = '';
    if (categories && categories.length > 0) {
      categoryId = categories[0].id;
    } else {
      // Create a default category if none exists to guarantee success!
      const { data: newCat, error: catErr } = await supabaseServer
        .from('categories')
        .insert({
          name: 'Genel Tartışma',
          slug: 'genel-tartisma',
          description: 'Mastodon mobil entegrasyonu ve genel paylaşımlar.',
          icon: 'MessageSquare'
        })
        .select('id')
        .single();
      
      if (catErr) {
        console.error('Error creating default category:', catErr);
        return NextResponse.json({ error: 'No category found and failed to create default category' }, { status: 500 });
      }
      categoryId = newCat.id;
    }

    // Split status text for title & content
    const firstLine = statusText.split('\n')[0].trim();
    const title = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine || 'Mobil Paylaşım';
    const content = statusText;

    // Create topic
    const { data: newTopic, error: topicErr } = await supabaseServer
      .from('topics')
      .insert({
        author_id: profile.id,
        category_id: categoryId,
        title: title,
        content: content
      })
      .select('*')
      .single();

    if (topicErr) {
      console.error('Error inserting topic via Mastodon API:', topicErr);
      return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
    }

    // Give user XP for creating a post! (Gamification integration!)
    try {
      await supabaseServer.rpc('increment_user_xp', { 
        user_id: profile.id, 
        xp_amount: 15 
      });
    } catch (xpErr) {
      // Non-blocking
    }

    const mapped = mapTopicToStatus(newTopic, profile, baseUrl);
    return new NextResponse(JSON.stringify(mapped), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (err: any) {
    console.error('Post Status API error:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
