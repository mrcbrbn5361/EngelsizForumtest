export function mapProfileToAccount(profile: any, baseUrl: string) {
  if (!profile) return null;

  const avatar = profile.avatar_url || `${baseUrl}/icon.png`;
  const note = profile.bio ? `<p>${escapeHtml(profile.bio)}</p>` : '<p>EngelsizForum üyesi.</p>';

  return {
    id: profile.id,
    username: profile.username || profile.id.substring(0, 8),
    acct: profile.username || profile.id.substring(0, 8),
    display_name: profile.full_name || profile.username || 'EngelsizForum Üyesi',
    locked: false,
    bot: false,
    discoverable: true,
    group: false,
    created_at: profile.created_at || new Date().toISOString(),
    note: note,
    url: `${baseUrl}/profile/${profile.id}`,
    avatar: avatar,
    avatar_static: avatar,
    header: `${baseUrl}/banner.png`,
    header_static: `${baseUrl}/banner.png`,
    followers_count: 0,
    following_count: 0,
    statuses_count: 0,
    last_status_at: null,
    emojis: [],
    roles: [],
    fields: [
      {
        name: 'Seviye',
        value: `Seviye ${profile.level || 1}`,
        verified_at: null
      },
      {
        name: 'Tecrübe (XP)',
        value: `${profile.xp || 0} XP`,
        verified_at: null
      }
    ]
  };
}

export function mapTopicToStatus(topic: any, authorProfile: any, baseUrl: string) {
  if (!topic) return null;

  const id = topic.id;
  const createdAt = topic.created_at || new Date().toISOString();
  
  // Format HTML content out of topic.title and topic.content
  const titleHtml = topic.title ? `<h3>${escapeHtml(topic.title)}</h3>` : '';
  const contentHtml = `<p>${escapeHtml(topic.content).replace(/\n/g, '<br />')}</p>`;
  const fullHtml = `<div>${titleHtml}${contentHtml}</div>`;

  const account = mapProfileToAccount(authorProfile || { id: topic.author_id }, baseUrl);

  return {
    id: id,
    created_at: createdAt,
    in_reply_to_id: null,
    in_reply_to_account_id: null,
    sensitive: false,
    spoiler_text: '',
    visibility: 'public',
    language: 'tr',
    uri: `${baseUrl}/api/v1/statuses/${id}`,
    url: `${baseUrl}/discussions/${id}`,
    replies_count: topic.comments_count || 0,
    reblogs_count: 0,
    favourites_count: topic.likes_count || 0,
    edited_at: topic.updated_at || null,
    favourited: false,
    reblogged: false,
    muted: false,
    bookmarked: false,
    content: fullHtml,
    account: account,
    media_attachments: [],
    mentions: [],
    tags: [],
    emojis: [],
    card: null,
    poll: null
  };
}

export function mapCommentToStatus(comment: any, authorProfile: any, topic: any, baseUrl: string) {
  if (!comment) return null;

  const id = comment.id;
  const createdAt = comment.created_at || new Date().toISOString();
  const contentHtml = `<p>${escapeHtml(comment.content).replace(/\n/g, '<br />')}</p>`;

  const account = mapProfileToAccount(authorProfile || { id: comment.author_id }, baseUrl);

  return {
    id: id,
    created_at: createdAt,
    in_reply_to_id: comment.topic_id || comment.parent_id || null,
    in_reply_to_account_id: topic?.author_id || null,
    sensitive: false,
    spoiler_text: '',
    visibility: 'public',
    language: 'tr',
    uri: `${baseUrl}/api/v1/statuses/${id}`,
    url: `${baseUrl}/discussions/${comment.topic_id || 'comment'}`,
    replies_count: 0,
    reblogs_count: 0,
    favourites_count: comment.likes_count || 0,
    edited_at: comment.updated_at || null,
    favourited: false,
    reblogged: false,
    muted: false,
    bookmarked: false,
    content: contentHtml,
    account: account,
    media_attachments: [],
    mentions: [],
    tags: [],
    emojis: [],
    card: null,
    poll: null
  };
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
