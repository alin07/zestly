import jwt from 'jsonwebtoken';
import { UserModel, ReferenceDataModel } from '../models';
import { Request, Response, NextFunction } from 'express';

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
  role?: any;
}

export interface AuthRequest extends Request {
  user?: AuthUser | undefined;
}

export const authenticateToken = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    req.user = undefined;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    // Get full user data from database
    const user = await UserModel.findById(decoded.id);
    if (!user || !user.is_active) {
      req.user = undefined;
      return next();
    }

    // Get user role
    const roles = await ReferenceDataModel.getRoles();
    const role = roles.find(r => r.id === user.role_id);

    req.user = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role_id: user.role_id,
      role: role
    };

    return next();
  } catch (error) {
    console.error('Token verification error:', error);
    req.user = undefined;
    return next();
  }
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  return next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.role || !roles.includes(req.user.role.name)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    return next();
  };
};

// GraphQL context function
export const createContext = ({ req }: { req: AuthRequest }) => {
  return {
    user: req.user,
    req
  };
};