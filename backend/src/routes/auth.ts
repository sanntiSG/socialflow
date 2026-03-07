import { Router, Request, Response } from 'express';
import passport from 'passport';
import { generateToken } from '../utils/jwt';
import { requireAuth } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    const token = generateToken(user._id.toString());
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// YouTube OAuth Callback (for connecting account)
router.get('/youtube/callback', requireAuth, async (req: Request, res: Response) => {
  const { code, error } = req.query;
  const user = req.user as any;

  if (error || !code) {
    return res.redirect(`${process.env.FRONTEND_URL}/settings?error=youtube_auth_failed`);
  }

  try {
    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/api/auth/youtube/callback`
    );

    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const channelRes = await youtube.channels.list({
      part: ['snippet', 'contentDetails'],
      mine: true
    });

    const channel = channelRes.data.items?.[0];
    if (!channel) throw new Error('No se encontró el canal de YouTube');

    const networkData = {
      network: 'youtube',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      userId: channel.id,
      username: channel.snippet.title,
      avatar: channel.snippet.thumbnails?.default?.url,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    };

    await User.findByIdAndUpdate(user._id, {
      $pull: { connectedNetworks: { network: 'youtube' } }
    });

    await User.findByIdAndUpdate(user._id, {
      $push: { connectedNetworks: networkData }
    });

    res.redirect(`${process.env.FRONTEND_URL}/settings?success=youtube_connected`);
  } catch (err) {
    console.error('YouTube Auth Error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/settings?error=youtube_process_failed`);
  }
});

// Get current user
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const fullUser = await User.findById(user._id).select('-connectedNetworks.accessToken -connectedNetworks.refreshToken');
    res.json({ user: fullUser });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo usuario' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.json({ message: 'Sesión cerrada correctamente' });
    });
  });
});

// Connect social network (save tokens)
router.post('/connect-network', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { network, accessToken, refreshToken, userId: networkUserId, username, avatar, expiresAt } = req.body;

    await User.findByIdAndUpdate(user._id, {
      $pull: { connectedNetworks: { network } }
    });

    await User.findByIdAndUpdate(user._id, {
      $push: {
        connectedNetworks: {
          network,
          accessToken,
          refreshToken,
          userId: networkUserId,
          username,
          avatar,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          connectedAt: new Date(),
        }
      }
    });

    res.json({ message: `${network} conectado correctamente` });
  } catch (error) {
    res.status(500).json({ error: 'Error conectando red social' });
  }
});

// Disconnect social network
router.delete('/disconnect-network/:network', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { network } = req.params;

    await User.findByIdAndUpdate(user._id, {
      $pull: { connectedNetworks: { network } }
    });

    res.json({ message: `${network} desconectado` });
  } catch (error) {
    res.status(500).json({ error: 'Error desconectando red social' });
  }
});

export default router;
