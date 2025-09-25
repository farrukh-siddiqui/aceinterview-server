import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Create a new user account (Sign Up)
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    hashedPassword: v.string(), // Password will be hashed in the NestJS service
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create user
    const userId = await ctx.db.insert('users', {
      email: args.email,
      name: args.name,
      hashedPassword: args.hashedPassword,
      emailVerified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Get user by email for login verification
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();
  },
});

// Get user by ID (useful for JWT payload validation)
export const getUserById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    // Return user without password for security
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
});

// Update user information
export const updateUser = mutation({
  args: {
    userId: v.id('users'),
    name: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    return await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Create a session for authenticated user
export const createSession = mutation({
  args: {
    userId: v.id('users'),
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('sessions', {
      userId: args.userId,
      token: args.token,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });
  },
});

// Get session by token for validation
export const getSessionByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();
  },
});

// Delete session (logout)
export const deleteSession = mutation({
  args: { sessionId: v.id('sessions') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sessionId);
  },
});

// Clean up expired sessions
export const cleanupExpiredSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredSessions = await ctx.db
      .query('sessions')
      .filter((q) => q.lt(q.field('expiresAt'), now))
      .collect();

    for (const session of expiredSessions) {
      await ctx.db.delete(session._id);
    }
  },
});
