import mongoose, { Document, Schema } from 'mongoose';

export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
export type NetworkType = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'twitter' | 'linkedin' | string;

export interface INetworkPost {
  network: NetworkType;
  status: PostStatus;
  text: string;
  hashtags?: string;
  privacy: 'public' | 'private' | 'friends' | 'unlisted';
  extraOptions?: Record<string, any>;
  publishedAt?: Date;
  publishedId?: string;
  publishedUrl?: string;
  error?: string;
  scheduledAt?: Date;
}

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  title?: string;
  mediaUrl?: string;
  mediaPublicId?: string;
  mediaType: 'image' | 'video' | 'gif' | 'carousel' | 'text';
  mediaMimeType?: string;
  networks: INetworkPost[];
  globalText?: string;
  scheduledAt?: Date;
  publishNow: boolean;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
}

const NetworkPostSchema = new Schema<INetworkPost>({
  network: { type: String, required: true },
  status: { type: String, enum: ['draft', 'scheduled', 'publishing', 'published', 'failed'], default: 'draft' },
  text: { type: String, default: '' },
  hashtags: { type: String },
  privacy: { type: String, enum: ['public', 'private', 'friends', 'unlisted'], default: 'public' },
  extraOptions: { type: Schema.Types.Mixed },
  publishedAt: { type: Date },
  publishedId: { type: String },
  publishedUrl: { type: String },
  error: { type: String },
  scheduledAt: { type: Date },
});

const PostSchema = new Schema<IPost>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String },
  mediaUrl: { type: String },
  mediaPublicId: { type: String },
  mediaType: { type: String, enum: ['image', 'video', 'gif', 'carousel', 'text'], required: true },
  mediaMimeType: { type: String },
  networks: [NetworkPostSchema],
  globalText: { type: String },
  scheduledAt: { type: Date },
  publishNow: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'scheduled', 'publishing', 'published', 'failed'], default: 'draft' },
}, { timestamps: true });

PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ scheduledAt: 1, status: 1 });

export default mongoose.model<IPost>('Post', PostSchema);
