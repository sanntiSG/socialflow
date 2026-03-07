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
