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
router.get('/youtube/callback', async (req: Request, res: Response) => {
  const { code, error, state } = req.query;

  if (error || !code) {
    return res.redirect(`${process.env.FRONTEND_URL}/settings?error=youtube_auth_failed`);
  }

  try {
    // Si no hay usuario en sesión, intentamos recuperarlo del token que pasamos en 'state'
    let currentUser = req.user as any;

    if (!currentUser && state) {
      const { verifyToken } = require('../utils/jwt');
      const decoded = verifyToken(state as string);
      currentUser = await User.findById(decoded.userId);
    }

    if (!currentUser) throw new Error('No se pudo identificar al usuario');

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

    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { connectedNetworks: { network: 'youtube' } }
    });

    await User.findByIdAndUpdate(currentUser._id, {
      $push: { connectedNetworks: networkData }
    });

    res.redirect(`${process.env.FRONTEND_URL}/settings?success=youtube_connected`);
  } catch (err) {
    console.error('YouTube Auth Error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/settings?error=youtube_process_failed`);
  }
});

// Instagram OAuth Callback
router.get('/instagram/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error || !code) {
    return res.redirect(`${process.env.FRONTEND_URL}/settings?error=instagram_auth_failed`);
  }

  try {
    const axios = require('axios');
    const { verifyToken } = require('../utils/jwt');
    const decoded = verifyToken(state as string);
    const currentUser = await User.findById(decoded.userId);

    if (!currentUser) throw new Error('Usuario no encontrado');

    // 1. Intercambiar código por token de corta duración
    const tokenRes = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: `${process.env.BACKEND_URL}/api/auth/instagram/callback`,
        code
      }
    });

    const shortToken = tokenRes.data.access_token;

    // 2. Intercambiar por token de larga duración
    const longTokenRes = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        fb_exchange_token: shortToken
      }
    });

    const accessToken = longTokenRes.data.access_token;

    // 3. Obtener Páginas de Facebook y sus cuentas de Instagram vinculadas
    const accountsRes = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: { access_token: accessToken, fields: 'instagram_business_account,name' }
    });

    const pages = accountsRes.data.data;
    const pageWithIG = pages.find((p: any) => p.instagram_business_account);

    if (!pageWithIG) {
      throw new Error('No se encontró una cuenta de Instagram Business vinculada a una página de Facebook');
    }

    const igId = pageWithIG.instagram_business_account.id;

    // 4. Obtener info de la cuenta de Instagram
    const igInfoRes = await axios.get(`https://graph.facebook.com/v18.0/${igId}`, {
      params: { access_token: accessToken, fields: 'username,profile_picture_url' }
    });

    const igInfo = igInfoRes.data;

    const networkData = {
      network: 'instagram',
      accessToken: accessToken,
      userId: igId,
      username: igInfo.username,
      avatar: igInfo.profile_picture_url,
      connectedAt: new Date(),
    };

    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { connectedNetworks: { network: 'instagram' } }
    });

    await User.findByIdAndUpdate(currentUser._id, {
      $push: { connectedNetworks: networkData }
    });

    res.redirect(`${process.env.FRONTEND_URL}/settings?success=instagram_connected`);
  } catch (err: any) {
    console.error('Instagram Connect Error:', err.message);
    res.redirect(`${process.env.FRONTEND_URL}/settings?error=instagram_process_failed`);
  }
});

// Facebook OAuth Callback
router.get('/facebook/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error || !code) {
    return res.redirect(`${process.env.FRONTEND_URL}/settings?error=facebook_auth_failed`);
  }

  try {
    const axios = require('axios');
    const { verifyToken } = require('../utils/jwt');
    const decoded = verifyToken(state as string);
    const currentUser = await User.findById(decoded.userId);

    if (!currentUser) throw new Error('Usuario no encontrado');

    // 1. Intercambiar código por token
    const tokenRes = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: `${process.env.BACKEND_URL}/api/auth/facebook/callback`,
        code
      }
    });

    const accessToken = tokenRes.data.access_token;

    // 2. Obtener info del perfil
    const meRes = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: { access_token: accessToken, fields: 'id,name,picture' }
    });

    const networkData = {
      network: 'facebook',
      accessToken: accessToken,
      userId: meRes.data.id,
      username: meRes.data.name,
      avatar: meRes.data.picture?.data?.url,
      connectedAt: new Date(),
    };

    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { connectedNetworks: { network: 'facebook' } }
    });

    await User.findByIdAndUpdate(currentUser._id, {
      $push: { connectedNetworks: networkData }
    });

    res.redirect(`${process.env.FRONTEND_URL}/settings?success=facebook_connected`);
  } catch (err: any) {
    console.error('Facebook Connect Error:', err.message);
    res.redirect(`${process.env.FRONTEND_URL}/settings?error=facebook_process_failed`);
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
