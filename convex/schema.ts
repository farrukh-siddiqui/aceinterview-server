import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Users table to store user account information
  users: defineTable({
    email: v.string(),
    name: v.string(),
    hashedPassword: v.string(),
    emailVerified: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_email', ['email']), // Index for fast email lookups

  // Sessions table for managing user login sessions
  sessions: defineTable({
    userId: v.id('users'),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index('by_token', ['token']) // Index for fast token lookups
    .index('by_user', ['userId']), // Index for finding user sessions
});
