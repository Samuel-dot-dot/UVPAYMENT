export interface Profile {
  id: string;
  discord_id: string | null;
  email: string | null;
  role: 'guest' | 'subscriber' | 'admin' | 'owner';
  subscription_status: 'inactive' | 'active' | 'past_due' | 'canceled';
  stripe_customer_id?: string | null;
  avatar_url?: string | null;
}

export interface Video {
  id: string;
  title: string;
  video_url: string | null;
  is_locked: boolean;
}

export interface Database {
  profiles: Profile;
  videos: Video;
}
