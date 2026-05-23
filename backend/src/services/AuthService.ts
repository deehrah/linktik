import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import env from '@/config/env';
import { AppError } from '@/middleware/errorHandler.middleware';

// Validation schemas
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    planTier: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface TokenPayload {
  userId: string;
  email: string;
}

export class AuthService {
  private jwtSecret = env.JWT_SECRET;
  private jwtRefreshSecret = env.JWT_REFRESH_SECRET;
  private jwtExpiry = env.JWT_EXPIRY;
  private refreshExpiry = env.JWT_REFRESH_EXPIRY;

  async signup(input: SignupInput): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError(409, 'Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planTier: user.planTier,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      input.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planTier: user.planTier,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        this.jwtRefreshSecret
      ) as TokenPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      const { accessToken } = this.generateTokens({
        userId: user.id,
        email: user.email,
      });

      return { accessToken };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(401, 'Invalid refresh token');
    }
  }

  private generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiry,
    });

    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.refreshExpiry,
    });

    return { accessToken, refreshToken };
  }

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        planTier: true,
        createdAt: true,
      },
    });
  }
}
