import { Request, Response } from 'express';
import { User } from './database';

export interface Context {
  req: Request;
  res: Response;
  user?: User;
  isAuthenticated: boolean;
}