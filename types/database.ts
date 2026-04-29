export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
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
  name: string;
  slug: string;
  description: string;
  icon: string;
};

export type Topic = {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  pinned: boolean;
  author?: Profile;
  category?: Category;
};

export type Comment = {
  id: string;
  topic_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
};
