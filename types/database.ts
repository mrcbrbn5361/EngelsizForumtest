export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'moderator' | 'user';
  level: number;
  xp: number;
  reputation_points: number;
  bio: string | null;
  is_verified: boolean;
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
  voice?: VoiceMessage | null;
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
  file_size?: number | null;
  mime_type?: string | null;
  transcription?: string | null;
  created_at?: string | null;
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
