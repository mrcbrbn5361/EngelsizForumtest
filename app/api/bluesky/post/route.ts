import { NextRequest, NextResponse } from 'next/server';

function parseFacets(text: string) {
  const facets: any[] = [];
  const encoder = new TextEncoder();

  // Link matching
  const urlRegex = /https?:\/\/[^\s]+/g;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];
    const byteStart = encoder.encode(text.substring(0, match.index)).byteLength;
    const byteEnd = byteStart + encoder.encode(url).byteLength;
    facets.push({
      index: { byteStart, byteEnd },
      features: [{ '$type': 'app.bsky.richtext.facet#link', uri: url }],
    });
  }

  // Hashtag matching
  const tagRegex = /#([\wğüşıöçĞÜŞİÖÇ]+)/g;
  while ((match = tagRegex.exec(text)) !== null) {
    const tag = match[1];
    const fullTag = match[0];
    const byteStart = encoder.encode(text.substring(0, match.index)).byteLength;
    const byteEnd = byteStart + encoder.encode(fullTag).byteLength;
    facets.push({
      index: { byteStart, byteEnd },
      features: [{ '$type': 'app.bsky.richtext.facet#tag', tag: tag }],
    });
  }

  return facets;
}

export async function POST(req: NextRequest) {
  try {
    const { text, handle, password } = await req.json();

    const bskyHandle = handle || process.env.BSKY_HANDLE || 'miracbirben.bsky.social';
    const bskyPassword = password || process.env.BSKY_PASSWORD;

    if (!bskyPassword) {
      return NextResponse.json(
        { error: 'Bluesky app password (BSKY_PASSWORD) is required or not configured.' },
        { status: 400 }
      );
    }

    // Format current date and time (Turkey Time)
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul', day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' });
    const dateTime = `${dateStr} ${timeStr}`;

    let cleanCommit = (text || 'Platform güncellemeleri ve erişilebilirlik iyileştirmeleri yayınlandı!').trim();
    cleanCommit = cleanCommit.replace(/```[\s\S]*?```/g, '').replace(/ALTER TABLE[\s\S]*/gi, 'Veritabanı esnekliği ve kategori yönetimi güçlendirildi.').trim();

    let postText = `🚀 EngelsizForum Güncellendi! / Updated!\n📅 ${dateTime}\n\n🇹🇷 ${cleanCommit}\n🇬🇧 New platform updates & accessibility features deployed!\n\n🌐 https://engelsizforum.com\n\n#EngelsizForum #A11y #WebDev`;

    if (postText.length > 295) {
      const extraChars = postText.length - 292;
      const maxLen = Math.max(20, cleanCommit.length - extraChars);
      cleanCommit = cleanCommit.substring(0, maxLen) + '...';
      postText = `🚀 EngelsizForum Güncellendi! / Updated!\n📅 ${dateTime}\n\n🇹🇷 ${cleanCommit}\n🇬🇧 New platform updates & accessibility features deployed!\n\n🌐 https://engelsizforum.com\n\n#EngelsizForum #A11y #WebDev`;

      if (postText.length > 295) {
        postText = `🚀 EngelsizForum Güncellendi! / Updated!\n📅 ${dateTime}\n\n🇹🇷 ${cleanCommit}\n🇬🇧 New platform updates live!\n\n🌐 https://engelsizforum.com\n\n#EngelsizForum #A11y #WebDev`;
      }
    }

    const facets = parseFacets(postText);

    // 1. Authenticate with Bluesky
    const authRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: bskyHandle, password: bskyPassword }),
    });

    if (!authRes.ok) {
      const errData = await authRes.text();
      return NextResponse.json({ error: `Bluesky authentication failed: ${errData}` }, { status: 401 });
    }

    const session = await authRes.json();
    const accessJwt = session.accessJwt;
    const repo = session.did;

    // 2. Create post record with rich text facets
    const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repo: repo,
        collection: 'app.bsky.feed.post',
        record: {
          text: postText,
          facets: facets,
          createdAt: new Date().toISOString(),
        },
      }),
    });

    if (!postRes.ok) {
      const postErr = await postRes.text();
      return NextResponse.json({ error: `Failed to create post on Bluesky: ${postErr}` }, { status: 500 });
    }

    const postResult = await postRes.json();
    return NextResponse.json({ success: true, uri: postResult.uri, handle: bskyHandle, postText });
  } catch (error: any) {
    console.error('Bluesky API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

