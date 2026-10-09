import { Subscription, AuditSummary } from '../types/subscription';
import { db } from './db';

// Frontend API service layer
// Connects to /api/* routes or directly to db storage layer with seamless fallback
export const api = {
  subscriptions: {
    async list(userId?: string): Promise<Subscription[]> {
      return db.getSubscriptions(userId);
    },
    async get(id: string, userId?: string): Promise<Subscription | null> {
      return db.getSubscriptionById(id, userId);
    },
    async create(
      data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>,
      userId?: string
    ): Promise<{ data?: Subscription; errors?: Record<string, string> }> {
      return db.createSubscription(data, userId);
    },
    async update(
      id: string,
      patch: Partial<Subscription>,
      userId?: string
    ): Promise<{ data?: Subscription; errors?: Record<string, string> }> {
      return db.updateSubscription(id, patch, userId);
    },
    async delete(id: string, userId?: string): Promise<boolean> {
      return db.deleteSubscription(id, userId);
    },
    async markUsed(id: string, dateStr?: string, userId?: string): Promise<Subscription | null> {
      return db.markSubscriptionUsed(id, dateStr, userId);
    },
  },
  audit: {
    async run(unusedDaysThreshold: number = 30, userId?: string): Promise<AuditSummary> {
      return db.runAudit(userId, unusedDaysThreshold);
    },
  },
  seed: {
    async reset(userId?: string): Promise<Subscription[]> {
      return db.resetToSeed(userId);
    },
  },
};
