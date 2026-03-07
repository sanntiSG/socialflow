import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Placeholder for social OAuth flows
// Each network has its own OAuth redirect
router.get('/:network/auth', requireAuth, (req: Request, res: Response) => {
  const { network } = req.params;
  const oauthUrls: Record<string, string> = {
    facebook: `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${process.env.BACKEND_URL}/api/auth/facebook/callback&scope=public_profile,email&state=${req.query.token}`,
    tiktok: `https://www.tiktok.com/v2/auth/authorize?client_key=${process.env.TIKTOK_CLIENT_KEY}&redirect_uri=${process.env.BACKEND_URL}/api/auth/tiktok/callback&scope=user.info.basic,video.publish&response_type=code&state=${req.query.token}`,
    youtube: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.BACKEND_URL}/api/auth/youtube/callback&scope=https://www.googleapis.com/auth/youtube.upload+https://www.googleapis.com/auth/youtube.readonly+https://www.googleapis.com/auth/userinfo.profile&response_type=code&access_type=offline&prompt=select_account&state=${req.query.token}`,
    instagram: `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${process.env.BACKEND_URL}/api/auth/instagram/callback&scope=public_profile,email&state=${req.query.token}`,
  };

  const url = oauthUrls[network];
  if (!url) return res.status(400).json({ error: 'Red social no soportada' });
  res.redirect(url);
});

export default router;
