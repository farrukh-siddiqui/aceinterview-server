import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User Registration Endpoint
   * POST /auth/signup
   * Creates a new user account with encrypted password
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto) {
    const { email, password, name } = signUpDto;
    return await this.authService.signUp(email, password, name);
  }

  /**
   * User Login Endpoint
   * POST /auth/signin
   * Authenticates user and returns JWT token
   */
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto) {
    const { email, password } = signInDto;
    return await this.authService.signIn(email, password);
  }

  /**
   * User Logout Endpoint
   * POST /auth/signout
   * Invalidates the user's session
   */
  @Post('signout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async signOut(@Request() req: AuthenticatedRequest) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    return await this.authService.signOut(token);
  }

  /**
   * Get User Profile Endpoint
   * GET /auth/profile
   * Returns authenticated user's profile information
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: AuthenticatedRequest) {
    return await this.authService.getProfile(req.user.id);
  }

  /**
   * Health Check for Authentication
   * GET /auth/me
   * Validates JWT token and returns user info
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@Request() req: AuthenticatedRequest) {
    return {
      user: req.user,
      message: 'Token is valid',
    };
  }
}
