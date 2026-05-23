import { Request, Response } from 'express';
import {
  AuthService,
  signupSchema,
  loginSchema,
  refreshSchema,
} from '@/services/AuthService';
import { asyncHandler, AppError } from '@/middleware/errorHandler.middleware';

const authService = new AuthService();

export class AuthController {
  signup = asyncHandler(async (req: Request, res: Response) => {
    const input = signupSchema.parse(req.body);
    const result = await authService.signup(input);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Account created successfully',
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json({
      success: true,
      data: result,
      message: 'Logged in successfully',
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const input = refreshSchema.parse(req.body);
    const result = await authService.refresh(input.refreshToken);
    res.json({
      success: true,
      data: result,
    });
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const user = await authService.getUserById(req.user.id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      success: true,
      data: user,
    });
  });
}
