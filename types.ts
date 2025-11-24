export type UserRole = 'guest' | 'subscriber' | 'admin' | 'owner';

export interface UserProfile {
  id: string;
  discord_id: string;
  email: string;
  role: UserRole;
  subscription_status: string;
  stripe_customer_id?: string;
  avatar_url?: string;
}

export interface VideoContent {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string;
  views: number;
  uploadDate: string;
}

export interface StatMetric {
  label: string;
  value: string | number;
  trend?: string;
  positive?: boolean;
}