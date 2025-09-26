/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConvexService } from '../convex/convex.service';
import { Id } from '../../convex/_generated/dataModel';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
  };
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly convexService: ConvexService,
    private readonly jwtService: JwtService,
  ) {}

  // Sign up a new user
  async signUp(
    email: string,
    password: string,
    name: string,
  ): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.convexService.getUserByEmail(email);
      if (existingUser) {
        throw new ConflictException('User already exists with this email');
      }

      // Hash password
      const daddy = 12;
      const hashedPassword = await bcrypt.hash(password, daddy);

      // Create user in database
      const userId = await this.convexService.createUser(
        email,
        name,
        hashedPassword,
      );

      // Generate JWT token
      const payload: JwtPayload = {
        sub: userId,
        email,
        name,
      };
      const access_token = this.jwtService.sign(payload);

      // Create session in database
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      await this.convexService.createSession(userId, access_token, expiresAt);

      return {
        user: {
          id: userId,
          email,
          name,
          emailVerified: false,
        },
        access_token,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Failed to create user account');
    }
  }

  // Sign in an existing user
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Get user by email
      const user = await this.convexService.getUserByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        password,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        (user as any).hashedPassword,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate JWT token
      const userAny = user;
      const payload: JwtPayload = {
        sub: userAny._id,
        email: userAny.email,
        name: userAny.name,
      };
      const access_token = this.jwtService.sign(payload);

      // Create session in database
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      await this.convexService.createSession(
        userAny._id,
        access_token,
        expiresAt,
      );

      return {
        user: {
          id: userAny._id,
          email: userAny.email,
          name: userAny.name,
          emailVerified: userAny.emailVerified || false,
        },
        access_token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  // Validate JWT token and return user info
  async validateUser(payload: JwtPayload) {
    try {
      const user = await this.convexService.getUserById(
        payload.sub as Id<'users'>,
      );
      if (!user) {
        return null;
      }

      // Check if session exists and is valid
      const session = await this.convexService.getSessionByToken(
        this.jwtService.sign(payload),
      );

      // eslint-disable-next-line prettier/prettier
      if (!session || (session).expiresAt < Date.now()) {
        return null;
      }

      const userAny = user;
      return {
        id: userAny._id,
        email: userAny.email,
        name: userAny.name,
        emailVerified: userAny.emailVerified,
      };
    } catch {
      return null;
    }
  }

  // Sign out user (invalidate session)
  async signOut(token: string): Promise<{ message: string }> {
    try {
      const session = await this.convexService.getSessionByToken(token);
      if (session) {
        await this.convexService.deleteSession((session)._id);
      }
      return { message: 'Successfully signed out' };
    } catch {
      throw new Error('Failed to sign out');
    }
  }

  // Get user profile
  async getProfile(userId: string) {
    try {
      const user = await this.convexService.getUserById(userId as Id<'users'>);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const userAny = user;
      return {
        id: userAny._id,
        email: userAny.email,
        name: userAny.name,
        emailVerified: userAny.emailVerified,
        createdAt: userAny.createdAt,
        updatedAt: userAny.updatedAt,
      };
    } catch {
      throw new UnauthorizedException('Failed to get user profile');
    }
  }
}
