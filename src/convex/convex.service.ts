/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { ConvexClient } from 'convex/browser';

@Injectable()
export class ConvexService {
  private client: ConvexClient;

  constructor() {
    // Initialize Convex client with your deployment URL
    this.client = new ConvexClient(
      process.env.CONVEX_URL || 'https://knowing-bobcat-872.convex.cloud',
    );
  }

  getClient() {
    return this.client;
  }

  // User management operations - using any type for now to bypass import issues
  async createUser(
    email: string,
    name: string,
    hashedPassword: string,
  ): Promise<string> {
    const result = await (this.client as any).mutation('users:createUser', {
      email,
      name,
      hashedPassword,
    });
    return result;
  }

  async getUserByEmail(email: string): Promise<any> {
    return await (this.client as any).query('users:getUserByEmail', { email });
  }

  async getUserById(userId: string): Promise<any> {
    return await (this.client as any).query('users:getUserById', { userId });
  }

  async updateUser(
    userId: string,
    updates: { name?: string; emailVerified?: boolean },
  ): Promise<any> {
    return await (this.client as any).mutation('users:updateUser', {
      userId,
      ...updates,
    });
  }

  // Session management operations
  async createSession(userId: string, token: string, expiresAt: number): Promise<any> {
    return await (this.client as any).mutation('users:createSession', {
      userId,
      token,
      expiresAt,
    });
  }

  async getSessionByToken(token: string): Promise<any> {
    return await (this.client as any).query('users:getSessionByToken', { token });
  }

  async deleteSession(sessionId: string): Promise<any> {
    return await (this.client as any).mutation('users:deleteSession', { sessionId });
  }

  async cleanupExpiredSessions(): Promise<any> {
    return await (this.client as any).mutation('users:cleanupExpiredSessions', {});
  }
}
