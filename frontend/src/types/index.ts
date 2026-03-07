export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  connectedNetworks: ConnectedNetwork[];
  createdAt: string;
}

export interface ConnectedNetwork {
  network: NetworkType;
  username: string;
  avatar?: string;
  connectedAt: string;
}

export type NetworkType = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'twitter' | 'linkedin';

export type MediaType = 'image' | 'video' | 'gif' | 'carousel' | 'text';
export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
export type PrivacyType = 'public' | 'private' | 'friends' | 'unlisted';

export interface NetworkPost {
  network: NetworkType;
  status: PostStatus;
  text: string;
  hashtags?: string;
  privacy: PrivacyType;
  extraOptions?: Record<string, any>;
  publishedAt?: string;
  publishedUrl?: string;
  error?: string;
  scheduledAt?: string;
}

export interface Post {
  _id: string;
  userId: string;
  title?: string;
  mediaUrl?: string;
  mediaType: MediaType;
  mediaMimeType?: string;
  networks: NetworkPost[];
  globalText?: string;
  scheduledAt?: string;
  publishNow: boolean;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NetworkConfig {
  id: NetworkType;
  name: string;
  color: string;
  icon: string;
  supportsVideo: boolean;
  supportsImage: boolean;
}

export interface DashboardStats {
  stats: {
    total: number;
    scheduled: number;
    published: number;
    failed: number;
    draft: number;
  };
  recent: Post[];
  byNetwork: { _id: string; count: number; published: number }[];
  postsByDay: { _id: string; count: number }[];
}
