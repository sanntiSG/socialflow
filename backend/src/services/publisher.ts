import axios from 'axios';
import Post, { IPost } from '../models/Post';
import User from '../models/User';
import { deleteFromCloudinary } from '../utils/cloudinary';

export const publishPost = async (postId: string, userId: string): Promise<void> => {
  const post = await Post.findById(postId);
  const user = await User.findById(userId);
  if (!post || !user) return;

  post.status = 'publishing';
  await post.save();

  let allSuccess = true;

  for (let i = 0; i < post.networks.length; i++) {
    const networkPost = post.networks[i];
    const connectedNetwork = user.connectedNetworks.find(n => n.network === networkPost.network);

    if (!connectedNetwork) {
      networkPost.status = 'failed';
      networkPost.error = 'Red social no conectada';
      allSuccess = false;
      continue;
    }

    try {
      await publishToNetwork(networkPost.network, {
        accessToken: connectedNetwork.accessToken,
        userId: connectedNetwork.userId,
        text: networkPost.text,
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType,
        privacy: networkPost.privacy,
        extraOptions: networkPost.extraOptions,
      });

      networkPost.status = 'published';
      networkPost.publishedAt = new Date();
    } catch (error: any) {
      networkPost.status = 'failed';
      networkPost.error = error.message;
      allSuccess = false;
    }
  }

  post.status = allSuccess ? 'published' : 'failed';

  // Delete from Cloudinary if all published
  if (post.mediaPublicId && allSuccess) {
    await deleteFromCloudinary(post.mediaPublicId, post.mediaType === 'video' ? 'video' : 'image');
    post.mediaPublicId = undefined;
  }

  await post.save();
};

const publishToNetwork = async (network: string, options: {
  accessToken: string;
  userId: string;
  text: string;
  mediaUrl?: string;
  mediaType: string;
  privacy: string;
  extraOptions?: Record<string, any>;
}) => {
  switch (network) {
    case 'facebook':
      return publishToFacebook(options);
    case 'instagram':
      return publishToInstagram(options);
    case 'tiktok':
      return publishToTikTok(options);
    case 'youtube':
      return publishToYouTube(options);
    default:
      throw new Error(`Red social ${network} no implementada`);
  }
};

const publishToFacebook = async (opts: any) => {
  const endpoint = opts.mediaUrl
    ? `https://graph.facebook.com/v18.0/${opts.userId}/photos`
    : `https://graph.facebook.com/v18.0/${opts.userId}/feed`;
  
  const params: any = { access_token: opts.accessToken, message: opts.text };
  if (opts.mediaUrl && opts.mediaType === 'image') params.url = opts.mediaUrl;

  const response = await axios.post(endpoint, params);
  return response.data;
};

const publishToInstagram = async (opts: any) => {
  // Step 1: Create media container
  const containerResponse = await axios.post(
    `https://graph.facebook.com/v18.0/${opts.userId}/media`,
    {
      access_token: opts.accessToken,
      caption: opts.text,
      ...(opts.mediaType === 'video' ? { video_url: opts.mediaUrl, media_type: 'REELS' } : { image_url: opts.mediaUrl }),
    }
  );

  const containerId = containerResponse.data.id;

  // Step 2: Publish container
  const publishResponse = await axios.post(
    `https://graph.facebook.com/v18.0/${opts.userId}/media_publish`,
    { access_token: opts.accessToken, creation_id: containerId }
  );

  return publishResponse.data;
};

const publishToTikTok = async (opts: any) => {
  // TikTok Content Posting API
  const response = await axios.post(
    'https://open.tiktokapis.com/v2/post/publish/video/init/',
    {
      post_info: { title: opts.text, privacy_level: opts.privacy === 'public' ? 'PUBLIC_TO_EVERYONE' : 'SELF_ONLY' },
      source_info: { source: 'PULL_FROM_URL', video_url: opts.mediaUrl },
    },
    { headers: { Authorization: `Bearer ${opts.accessToken}` } }
  );
  return response.data;
};

const publishToYouTube = async (opts: any) => {
  const response = await axios.post(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      snippet: { title: opts.text || 'Mi video', description: opts.text },
      status: { privacyStatus: opts.privacy === 'public' ? 'public' : opts.privacy },
    },
    { headers: { Authorization: `Bearer ${opts.accessToken}` } }
  );
  return response.data;
};
