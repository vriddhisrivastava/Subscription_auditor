export type BillingCycle = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL' | 'YEARLY';

export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'PAUSED' | 'CANCELLED';

export type SubscriptionCategory =
  | 'STREAMING_VIDEO'
  | 'STREAMING_MUSIC'
  | 'PRODUCTIVITY_SOFTWARE'
  | 'GAMING'
  | 'FITNESS_HEALTH'
  | 'CLOUD_STORAGE'
  | 'NEWS_MEDIA'
  | 'FOOD_DELIVERY'
  | 'UTILITIES_SERVICES'
  | 'EDUCATION'
  | 'OTHER';

export type AuditSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export type AuditType =
  | 'DUPLICATE_CATEGORY'
  | 'UNUSED_SERVICE'
  | 'PRICE_INCREASE'
  | 'TRIAL_EXPIRING'
  | 'EXPENSIVE_OUTLIER';

export type RecommendationDecision = 'KEEP' | 'REVIEW' | 'CANCEL';

export interface PriceHistory {
  id: string;
  subscriptionId: string;
  oldCost: number;
  newCost: number;
  effectiveDate: string;
  notes?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  category: SubscriptionCategory;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  nextRenewalDate: string; // ISO date string YYYY-MM-DD
  paymentMethod: string;
  status: SubscriptionStatus;
  lastUsedDate?: string | null; // ISO date string YYYY-MM-DD
  trialEndsDate?: string | null; // ISO date string YYYY-MM-DD
  previousCost?: number | null;
  notes?: string;
  websiteUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditFlag {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  type: AuditType;
  severity: AuditSeverity;
  title: string;
  message: string;
  potentialMonthlySaving: number;
  potentialAnnualSaving: number;
  relatedSubscriptionIds?: string[];
  suggestedAction: string;
  isDismissed?: boolean;
}

export interface Recommendation {
  subscriptionId: string;
  subscriptionName: string;
  category: SubscriptionCategory;
  monthlyCost: number;
  annualCost: number;
  decision: RecommendationDecision;
  score: number; // 0 (definitely cancel) to 100 (definitely keep)
  reasons: string[];
  actionRecommendation: string;
  potentialAnnualSavings: number;
}

export interface AuditSummary {
  totalMonthlySpend: number;
  totalYearlySpend: number;
  potentialMonthlySavings: number;
  potentialAnnualSavings: number;
  activeCount: number;
  trialCount: number;
  flags: AuditFlag[];
  recommendations: Recommendation[];
  duplicateCategories: {
    category: SubscriptionCategory;
    count: number;
    names: string[];
    monthlyTotal: number;
  }[];
  unusedSubscriptions: Subscription[];
  priceHikeSubscriptions: {
    subscription: Subscription;
    increaseAmount: number;
    percentage: number;
  }[];
  expiringTrials: Subscription[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: string;
  reminderDays: number;
}

export interface RenewalAlert {
  subscription: Subscription;
  daysRemaining: number;
  renewalDate: string;
  amount: number;
  isToday: boolean;
  isUrgent: boolean;
}

export const CATEGORY_INFO: Record<
  SubscriptionCategory,
  { label: string; icon: string; color: string; bg: string }
> = {
  STREAMING_VIDEO: {
    label: 'Video Streaming',
    icon: 'Tv',
    color: '#EF4444',
    bg: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
  STREAMING_MUSIC: {
    label: 'Music Streaming',
    icon: 'Headphones',
    color: '#10B981',
    bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  PRODUCTIVITY_SOFTWARE: {
    label: 'Productivity & Software',
    icon: 'Layers',
    color: '#3B82F6',
    bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  GAMING: {
    label: 'Gaming',
    icon: 'Gamepad2',
    color: '#8B5CF6',
    bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  FITNESS_HEALTH: {
    label: 'Fitness & Health',
    icon: 'Dumbbell',
    color: '#F59E0B',
    bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  CLOUD_STORAGE: {
    label: 'Cloud & Storage',
    icon: 'Cloud',
    color: '#06B6D4',
    bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  },
  NEWS_MEDIA: {
    label: 'News & Media',
    icon: 'Newspaper',
    color: '#EC4899',
    bg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },
  FOOD_DELIVERY: {
    label: 'Food & Dining',
    icon: 'Utensils',
    color: '#F97316',
    bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  UTILITIES_SERVICES: {
    label: 'Utilities & Services',
    icon: 'ShieldCheck',
    color: '#64748B',
    bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  },
  EDUCATION: {
    label: 'Education & Courses',
    icon: 'GraduationCap',
    color: '#14B8A6',
    bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  },
  OTHER: {
    label: 'Other Subscriptions',
    icon: 'Tag',
    color: '#6B7280',
    bg: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  },
};

export const BILLING_CYCLE_MULTIPLIER: Record<BillingCycle, number> = {
  WEEKLY: 52 / 12, // ~4.333
  MONTHLY: 1,
  QUARTERLY: 1 / 3,
  BIANNUAL: 1 / 6,
  YEARLY: 1 / 12,
};

export function calculateMonthlyCost(cost: number, cycle: BillingCycle): number {
  return Number((cost * BILLING_CYCLE_MULTIPLIER[cycle]).toFixed(2));
}

export function calculateAnnualCost(cost: number, cycle: BillingCycle): number {
  return Number((calculateMonthlyCost(cost, cycle) * 12).toFixed(2));
}

export function formatCurrency(amt: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(amt) ? 0 : 2,
  }).format(amt);
}
