import { Subscription, SubscriptionCategory, BillingCycle, SubscriptionStatus } from '../types/subscription';
import { SEED_SUBSCRIPTIONS, INITIAL_USER_ID } from '../../prisma/seed';
import { runSubscriptionAudit } from './auditEngine';

const STORAGE_KEY = 'subscription_auditor_db_v2';
const USER_KEY = 'subscription_auditor_user_v2';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateSubscriptionInput(input: Partial<Subscription>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length === 0) {
    errors.name = 'Subscription name is required';
  } else if (input.name.trim().length > 100) {
    errors.name = 'Name must be under 100 characters';
  }

  if (input.cost === undefined || input.cost === null || isNaN(Number(input.cost))) {
    errors.cost = 'Cost is required and must be a number';
  } else if (Number(input.cost) < 0) {
    errors.cost = 'Cost cannot be negative';
  }

  if (!input.category) {
    errors.category = 'Category is required';
  }

  if (!input.billingCycle) {
    errors.billingCycle = 'Billing cycle is required';
  }

  if (!input.nextRenewalDate) {
    errors.nextRenewalDate = 'Next renewal date is required';
  } else if (isNaN(Date.parse(input.nextRenewalDate))) {
    errors.nextRenewalDate = 'Invalid date format (expected YYYY-MM-DD)';
  }

  if (input.status === 'TRIAL' && !input.trialEndsDate && !input.nextRenewalDate) {
    errors.trialEndsDate = 'Trial conversion date is required for free trials';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

class DatabaseStore {
  private subscriptions: Subscription[] = [];
  private isLoaded = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.subscriptions = JSON.parse(stored);
          this.isLoaded = true;
          return;
        }
      } catch (e) {
        console.warn('LocalStorage error, using memory fallback:', e);
      }
    }

    // Default seed
    this.resetToSeed(INITIAL_USER_ID);
    this.isLoaded = true;
  }

  public resetToSeed(userId: string = INITIAL_USER_ID): Subscription[] {
    const timestamp = '2026-09-20T10:00:00.000Z';
    this.subscriptions = SEED_SUBSCRIPTIONS.map((item, idx) => ({
      ...item,
      id: `sub_${idx + 1}`,
      userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));
    this.persist();
    return [...this.subscriptions];
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.subscriptions));
      } catch (e) {
        console.warn('Failed to persist subscriptions to localStorage:', e);
      }
    }
  }

  public async getSubscriptions(userId: string = INITIAL_USER_ID): Promise<Subscription[]> {
    if (!this.isLoaded) this.init();
    return this.subscriptions.filter(s => s.userId === userId);
  }

  public async getSubscriptionById(id: string, userId: string = INITIAL_USER_ID): Promise<Subscription | null> {
    if (!this.isLoaded) this.init();
    const found = this.subscriptions.find(s => s.id === id && s.userId === userId);
    return found ? { ...found } : null;
  }

  public async createSubscription(
    data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string = INITIAL_USER_ID
  ): Promise<{ data?: Subscription; errors?: Record<string, string> }> {
    const validation = validateSubscriptionInput(data);
    if (!validation.valid) {
      return { errors: validation.errors };
    }

    const now = new Date().toISOString();
    const newSub: Subscription = {
      ...data,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: data.userId || userId,
      createdAt: now,
      updatedAt: now,
    };

    this.subscriptions.unshift(newSub);
    this.persist();
    return { data: newSub };
  }

  public async updateSubscription(
    id: string,
    patch: Partial<Subscription>,
    userId: string = INITIAL_USER_ID
  ): Promise<{ data?: Subscription; errors?: Record<string, string> }> {
    const index = this.subscriptions.findIndex(s => s.id === id && s.userId === userId);
    if (index === -1) {
      return { errors: { id: 'Subscription not found' } };
    }

    const existing = this.subscriptions[index];
    const updated = { ...existing, ...patch };

    const validation = validateSubscriptionInput(updated);
    if (!validation.valid) {
      return { errors: validation.errors };
    }

    // Check if price changed -> track previousCost
    if (patch.cost !== undefined && patch.cost !== existing.cost) {
      updated.previousCost = existing.cost;
    }

    updated.updatedAt = new Date().toISOString();
    this.subscriptions[index] = updated;
    this.persist();

    return { data: updated };
  }

  public async deleteSubscription(id: string, userId: string = INITIAL_USER_ID): Promise<boolean> {
    const beforeCount = this.subscriptions.length;
    this.subscriptions = this.subscriptions.filter(s => !(s.id === id && s.userId === userId));
    const deleted = this.subscriptions.length < beforeCount;
    if (deleted) {
      this.persist();
    }
    return deleted;
  }

  public async markSubscriptionUsed(id: string, dateStr: string = '2026-09-26', userId: string = INITIAL_USER_ID): Promise<Subscription | null> {
    const index = this.subscriptions.findIndex(s => s.id === id && s.userId === userId);
    if (index === -1) return null;

    this.subscriptions[index].lastUsedDate = dateStr;
    this.subscriptions[index].updatedAt = new Date().toISOString();
    this.persist();
    return { ...this.subscriptions[index] };
  }

  public async runAudit(userId: string = INITIAL_USER_ID, unusedDaysThreshold = 30) {
    const subs = await this.getSubscriptions(userId);
    return runSubscriptionAudit(subs, { unusedDaysThreshold, referenceDate: '2026-09-26' });
  }
}

export const db = new DatabaseStore();
