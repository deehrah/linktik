import { Request, Response } from 'express';
import {
  AuthService,
  signupSchema,
  loginSchema,
  refreshSchema,
} from '../services/AuthService';

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const input = signupSchema.parse(req.body);
      const result = await authService.signup(input);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const input = loginSchema.parse(req.body);
      const result = await authService.login(input);
      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }
      res.status(401).json({ error: error.message });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const input = refreshSchema.parse(req.body);
      const result = await authService.refresh(input.refreshToken);
      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }
      res.status(401).json({ error: error.message });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await authService.getUserById(req.user.userId);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
