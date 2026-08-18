export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'founder' | 'owner' | 'admin' | 'moderator' | 'expert' | 'verified' | 'support' | 'member' | 'user' | 'system' | string;
  level: number;
  xp: number;
  bio: string | null;
  is_verified: boolean;
  account_status?: 'active' | 'suspended' | 'banned' | 'deleted';
  status_reason?: string | null;
  suspended_until?: string | null;
  privacy_settings?: {
    show_email?: boolean;
    show_online_status?: boolean;
    show_activity?: boolean;
    allow_messages?: boolean;
    profile_visibility?: 'public' | 'members' | 'private' | boolean;
    show_activity_history?: boolean;
    allow_direct_messages?: 'everyone' | 'members' | 'none' | boolean;
    showEmail?: boolean;
    showOnlineStatus?: boolean;
    showActivity?: boolean;
    allowMessages?: boolean;
  } | null;
  notification_prefs?: {
    email_replies?: boolean;
    email_mentions?: boolean;
    email_digest?: boolean;
    in_app_notifications?: boolean;
    email?: boolean;
    browser?: boolean;
    sound?: boolean;
    digest_frequency?: string;
    emailReplies?: boolean;
    emailMentions?: boolean;
    emailDigest?: boolean;
    inAppNotifications?: boolean;
  } | null;
  accessibility_prefs: any | null;
  is_online?: boolean;
  last_seen?: string | null;
  last_seen_at?: string | null;
  followers_count?: number;
  following_count?: number;
  updated_at: string;
  created_at?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
};

export type Topic = {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved?: boolean;
  audio_url?: string | null;
  voice_duration?: number;
  updated_at?: string;
  created_at: string;
  author?: Profile;
  category?: Category;
  comments?: any[];
};

export type Comment = {
  id: string;
  topic_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  is_solution: boolean;
  audio_url?: string | null;
  voice_duration?: number;
  updated_at?: string;
  created_at: string;
  author?: Profile;
};


export type Badge = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
};

export type Reaction = {
  id: string;
  user_id: string;
  topic_id: string;
  reaction_type: string;
  created_at: string;
};

export type Report = {
  id: string;
  reporter_id: string;
  topic_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
};

export type Conversation = {
  id: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type?: 'text' | 'audio' | 'voice' | 'image' | 'file';
  audio_url?: string | null;
  media_url?: string | null;
  duration?: number;
  is_voice_message?: boolean;
  waveform?: number[];
  metadata?: any;
  read_at?: string | null;
  created_at: string;
  updated_at?: string;
};

export type VoiceMessage = {
  id: string;
  user_id: string;
  conversation_id?: string | null;
  topic_id?: string | null;
  comment_id?: string | null;
  audio_url: string;
  duration: number;
  file_size?: number;
  mime_type?: string;
  transcription?: string | null;
  waveform?: number[];
  created_at: string;
};


export type Upload = {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id?: string;
  recipient_id?: string;
  sender_id?: string;
  type: 'reply' | 'like' | 'mention' | 'system' | 'achievement' | 'comment' | 'follow' | string;
  title?: string;
  body?: string;
  content?: string;
  data?: any;
  read_at?: string | null;
  is_read?: boolean;
  created_at: string;
};

export type Attachment = {
  id: string;
  topic_id: string | null;
  comment_id: string | null;
  upload_id: string;
  created_at: string;
};

export type CategoryModerator = {
  id: string;
  category_id: string;
  user_id: string;
  assigned_by?: string | null;
  created_at: string;
  user?: Profile;
};

export type CommunityModerator = {
  id: string;
  community_id: string;
  user_id: string;
  role: 'owner' | 'moderator' | 'contributor';
  assigned_by?: string | null;
  created_at: string;
  user?: Profile;
};

