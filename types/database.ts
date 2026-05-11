export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'moderator' | 'user';
  level: number;
  xp: number;
  accessibility_prefs: {
    fontSize: 'sm' | 'md' | 'lg' | 'xl';
    highContrast: boolean;
    dyslexicFont: boolean;
    reducedMotion: boolean;
  } | null;
  updated_at: string;
};

export type Category = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
};

export type Topic = {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  is_solved: boolean;
  is_pinned: boolean;
  is_locked: boolean;
  likes_count?: number;
  created_at: string;
  author?: Profile;
  category?: Category;
  comments?: any[];
};

export type Comment = {
  id: string;
  topic_id: string;
  author_id: string;
  content: string;
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
