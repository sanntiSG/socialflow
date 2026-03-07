import cron from 'node-cron';
import Post from '../models/Post';
import { publishPost } from './publisher';

export const startScheduler = () => {
  // Check every minute for scheduled posts
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const scheduledPosts = await Post.find({
        status: 'scheduled',
        scheduledAt: { $lte: now },
      });

      for (const post of scheduledPosts) {
        console.log(`📅 Publicando post programado: ${post._id}`);
        await publishPost(post._id.toString(), post.userId.toString());
      }
    } catch (error) {
      console.error('Error en scheduler:', error);
    }
  });

  console.log('⏰ Scheduler de publicaciones iniciado');
};
