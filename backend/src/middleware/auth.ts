import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check session first
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }

    // Check JWT Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);
      if (user) {
        (req as any).user = user;
        return next();
      }
    }

    return res.status(401).json({ error: 'No autorizado. Por favor inicia sesión.' });
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};
