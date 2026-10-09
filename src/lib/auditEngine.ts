import {
  Subscription,
  AuditFlag,
  Recommendation,
  AuditSummary,
  calculateMonthlyCost,
  calculateAnnualCost,
  SubscriptionCategory,
  CATEGORY_INFO,
} from '../types/subscription';

export interface AuditConfig {
  unusedDaysThreshold: number; // e.g. 30 days
  trialWarningDays: number; // e.g. 7 days
  referenceDate?: string; // current date ISO string, defaults to current time
}

const DEFAULT_CONFIG: AuditConfig = {
  unusedDaysThreshold: 30,
  trialWarningDays: 7,
  referenceDate: '2026-09-26',
};

// Calculate difference in days between two ISO date strings (date2 - date1)
export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1.split('T')[0]);
  const d2 = new Date(dateStr2.split('T')[0]);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Format relative date nicely
export function formatDaysAgo(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 0) return `In ${Math.abs(days)} days`;
  return `${days} days ago`;
}

export function runSubscriptionAudit(
  subscriptions: Subscription[],
  config: Partial<AuditConfig> = {}
): AuditSummary {
  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE' || s.status === 'TRIAL');
  const nowStr = config.referenceDate || new Date().toISOString().split('T')[0];
  const unusedThreshold = config.unusedDaysThreshold ?? DEFAULT_CONFIG.unusedDaysThreshold;
  const trialWarningDays = config.trialWarningDays ?? DEFAULT_CONFIG.trialWarningDays;

  const flags: AuditFlag[] = [];
  const recommendations: Recommendation[] = [];

  // Group by category to identify overlaps
  const categoryGroups = new Map<SubscriptionCategory, Subscription[]>();
  for (const sub of activeSubs) {
    const list = categoryGroups.get(sub.category) || [];
    list.push(sub);
    categoryGroups.set(sub.category, list);
  }

  // 1. Detect duplicate / overlapping categories
  const duplicateCategories: AuditSummary['duplicateCategories'] = [];
  categoryGroups.forEach((subs, cat) => {
    // Categories that are known to typically be redundant when duplicated:
    const redundancyCategories: SubscriptionCategory[] = [
      'STREAMING_MUSIC',
      'STREAMING_VIDEO',
      'CLOUD_STORAGE',
      'FITNESS_HEALTH',
      'NEWS_MEDIA',
    ];

    if (subs.length > 1 && redundancyCategories.includes(cat)) {
      const names = subs.map(s => s.name);
      const monthlyTotal = subs.reduce(
        (sum, s) => sum + calculateMonthlyCost(s.cost, s.billingCycle),
        0
      );
      
      duplicateCategories.push({
        category: cat,
        count: subs.length,
        names,
        monthlyTotal: Number(monthlyTotal.toFixed(2)),
      });

      // Find the least recently used or most expensive redundant sub
      const sortedByUsage = [...subs].sort((a, b) => {
        const lastA = a.lastUsedDate ? new Date(a.lastUsedDate).getTime() : 0;
        const lastB = b.lastUsedDate ? new Date(b.lastUsedDate).getTime() : 0;
        return lastA - lastB; // oldest first
      });

      const primary = sortedByUsage[sortedByUsage.length - 1]; // most recently used
      const redundantCandidates = sortedByUsage.slice(0, -1);

      redundantCandidates.forEach(cand => {
        const monthlyCost = calculateMonthlyCost(cand.cost, cand.billingCycle);
        flags.push({
          id: `dup_${cand.id}_${cat}`,
          subscriptionId: cand.id,
          subscriptionName: cand.name,
          type: 'DUPLICATE_CATEGORY',
          severity: subs.length >= 3 ? 'HIGH' : 'MEDIUM',
          title: `Overlapping ${CATEGORY_INFO[cat].label} Subscription`,
          message: `You have ${subs.length} active services in ${CATEGORY_INFO[cat].label} (${names.join(', ')}). Consider keeping "${primary.name}" and cancelling "${cand.name}".`,
          potentialMonthlySaving: monthlyCost,
          potentialAnnualSaving: Number((monthlyCost * 12).toFixed(2)),
          relatedSubscriptionIds: subs.map(s => s.id).filter(id => id !== cand.id),
          suggestedAction: `Cancel or pause in favor of ${primary.name}`,
        });
      });
    }
  });

  // 2. Detect unused subscriptions
  const unusedSubscriptions: Subscription[] = [];
  activeSubs.forEach(sub => {
    if (!sub.lastUsedDate) {
      // Never marked as used or unknown
      const daysSinceCreated = getDaysDifference(sub.createdAt || nowStr, nowStr);
      if (daysSinceCreated >= unusedThreshold) {
        unusedSubscriptions.push(sub);
        const monthlyCost = calculateMonthlyCost(sub.cost, sub.billingCycle);
        flags.push({
          id: `unused_${sub.id}`,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          type: 'UNUSED_SERVICE',
          severity: 'HIGH',
          title: `Unused Subscription (${daysSinceCreated}+ days)`,
          message: `No recorded activity for "${sub.name}". You are paying ₹${monthlyCost.toFixed(2)}/mo (₹${(monthlyCost * 12).toFixed(2)}/yr) without active use.`,
          potentialMonthlySaving: monthlyCost,
          potentialAnnualSaving: Number((monthlyCost * 12).toFixed(2)),
          suggestedAction: 'Cancel subscription or log recent usage',
        });
      }
    } else {
      const daysSinceUsed = getDaysDifference(sub.lastUsedDate, nowStr);
      if (daysSinceUsed >= unusedThreshold) {
        unusedSubscriptions.push(sub);
        const monthlyCost = calculateMonthlyCost(sub.cost, sub.billingCycle);
        const severity: 'HIGH' | 'MEDIUM' = daysSinceUsed >= 60 ? 'HIGH' : 'MEDIUM';
        flags.push({
          id: `unused_${sub.id}`,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          type: 'UNUSED_SERVICE',
          severity,
          title: `Unused for ${daysSinceUsed} Days`,
          message: `"${sub.name}" was last used on ${sub.lastUsedDate} (${daysSinceUsed} days ago). Wasted spend: ₹${monthlyCost.toFixed(2)}/month.`,
          potentialMonthlySaving: monthlyCost,
          potentialAnnualSaving: Number((monthlyCost * 12).toFixed(2)),
          suggestedAction: 'Cancel or pause to save money',
        });
      }
    }
  });

  // 3. Detect price increases
  const priceHikeSubscriptions: AuditSummary['priceHikeSubscriptions'] = [];
  activeSubs.forEach(sub => {
    if (sub.previousCost !== null && sub.previousCost !== undefined && sub.cost > sub.previousCost) {
      const diff = Number((sub.cost - sub.previousCost).toFixed(2));
      const pct = Math.round((diff / sub.previousCost) * 100);
      const monthlyDiff = calculateMonthlyCost(diff, sub.billingCycle);

      priceHikeSubscriptions.push({
        subscription: sub,
        increaseAmount: diff,
        percentage: pct,
      });

      flags.push({
        id: `hike_${sub.id}`,
        subscriptionId: sub.id,
        subscriptionName: sub.name,
        type: 'PRICE_INCREASE',
        severity: pct >= 20 ? 'HIGH' : 'MEDIUM',
        title: `Price Jumped by +${pct}%`,
        message: `"${sub.name}" increased from ₹${sub.previousCost.toFixed(2)} to ₹${sub.cost.toFixed(2)} (+${pct}%). That's an extra ₹${(monthlyDiff * 12).toFixed(2)} per year.`,
        potentialMonthlySaving: monthlyDiff,
        potentialAnnualSaving: Number((monthlyDiff * 12).toFixed(2)),
        suggestedAction: 'Evaluate if features justify higher rate, or negotiate/downgrade',
      });
    }
  });

  // 4. Detect free trials about to convert to paid
  const expiringTrials: Subscription[] = [];
  activeSubs.forEach(sub => {
    if (sub.status === 'TRIAL') {
      const targetDate = sub.trialEndsDate || sub.nextRenewalDate;
      const daysUntilBilling = getDaysDifference(nowStr, targetDate);

      if (daysUntilBilling <= trialWarningDays && daysUntilBilling >= -1) {
        expiringTrials.push(sub);
        const nextAmount = sub.cost;
        const monthlyCost = calculateMonthlyCost(sub.cost, sub.billingCycle);

        flags.push({
          id: `trial_${sub.id}`,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          type: 'TRIAL_EXPIRING',
          severity: 'HIGH',
          title: `Free Trial Converts in ${daysUntilBilling <= 0 ? 'Today/Tomorrow' : `${daysUntilBilling} days`}`,
          message: `Trial for "${sub.name}" ends on ${targetDate}. Your payment method will be auto-charged ₹${nextAmount.toFixed(2)} (${sub.billingCycle.toLowerCase()}).`,
          potentialMonthlySaving: monthlyCost,
          potentialAnnualSaving: Number((monthlyCost * 12).toFixed(2)),
          suggestedAction: 'Set reminder or cancel before auto-charge',
        });
      }
    }
  });

  // 5. Generate Cancel or Keep Recommendations
  activeSubs.forEach(sub => {
    const monthly = calculateMonthlyCost(sub.cost, sub.billingCycle);
    const annual = calculateAnnualCost(sub.cost, sub.billingCycle);
    const reasons: string[] = [];
    let score = 75; // baseline neutral/favorable

    // Check usage
    if (sub.lastUsedDate) {
      const daysSince = getDaysDifference(sub.lastUsedDate, nowStr);
      if (daysSince <= 7) {
        score += 15;
        reasons.push(`Frequently used (${formatDaysAgo(daysSince)})`);
      } else if (daysSince <= 20) {
        score += 5;
        reasons.push(`Active recently (${daysSince} days ago)`);
      } else if (daysSince <= 45) {
        score -= 20;
        reasons.push(`Inactive for over a month (${daysSince} days ago)`);
      } else {
        score -= 45;
        reasons.push(`Severe dormancy: Not used in ${daysSince} days`);
      }
    } else {
      score -= 25;
      reasons.push('No recent usage recorded');
    }

    // Check duplicate
    const catSubs = categoryGroups.get(sub.category) || [];
    if (catSubs.length > 1) {
      score -= 20;
      reasons.push(`Redundant with other ${CATEGORY_INFO[sub.category].label} subscriptions`);
    }

    // Check price increase
    if (sub.previousCost && sub.cost > sub.previousCost) {
      const diff = sub.cost - sub.previousCost;
      const pct = Math.round((diff / sub.previousCost) * 100);
      score -= 10;
      reasons.push(`Recent price increase of +${pct}% (+₹${diff.toFixed(2)})`);
    }

    // Check trial
    if (sub.status === 'TRIAL') {
      score -= 15;
      reasons.push('Free trial pending recurring paid conversion');
    }

    // Check high cost outlier (> ₹2,000/mo)
    if (monthly >= 2000) {
      reasons.push(`High monthly impact (₹${monthly.toFixed(2)}/mo)`);
      if (score < 60) score -= 10;
    }

    // Clamp score 0 to 100
    score = Math.max(5, Math.min(95, score));

    let decision: 'KEEP' | 'REVIEW' | 'CANCEL' = 'KEEP';
    let actionRecommendation = 'Keep subscription active — provides continuous value.';

    if (score < 40) {
      decision = 'CANCEL';
      actionRecommendation = `Cancel immediately to recoup ₹${annual.toFixed(2)}/year with negligible lifestyle impact.`;
    } else if (score < 65) {
      decision = 'REVIEW';
      actionRecommendation = 'Review usage, consider pausing for 30 days or downgrading to a lower tier.';
    }

    recommendations.push({
      subscriptionId: sub.id,
      subscriptionName: sub.name,
      category: sub.category,
      monthlyCost: monthly,
      annualCost: annual,
      decision,
      score,
      reasons,
      actionRecommendation,
      potentialAnnualSavings: decision === 'CANCEL' ? annual : decision === 'REVIEW' ? annual * 0.5 : 0,
    });
  });

  // Sort recommendations: CANCEL first, then REVIEW, then KEEP
  const orderMap = { CANCEL: 0, REVIEW: 1, KEEP: 2 };
  recommendations.sort((a, b) => {
    if (orderMap[a.decision] !== orderMap[b.decision]) {
      return orderMap[a.decision] - orderMap[b.decision];
    }
    return a.score - b.score;
  });

  // Calculate totals
  const totalMonthlySpend = activeSubs.reduce(
    (acc, s) => acc + calculateMonthlyCost(s.cost, s.billingCycle),
    0
  );
  const totalYearlySpend = totalMonthlySpend * 12;

  // Potential savings from CANCEL + duplicate flags (deduplicated by sub ID)
  const cancelSubIds = new Set(
    recommendations.filter(r => r.decision === 'CANCEL').map(r => r.subscriptionId)
  );
  const potentialMonthlySavings = activeSubs
    .filter(s => cancelSubIds.has(s.id))
    .reduce((acc, s) => acc + calculateMonthlyCost(s.cost, s.billingCycle), 0);
  const potentialAnnualSavings = potentialMonthlySavings * 12;

  return {
    totalMonthlySpend: Number(totalMonthlySpend.toFixed(2)),
    totalYearlySpend: Number(totalYearlySpend.toFixed(2)),
    potentialMonthlySavings: Number(potentialMonthlySavings.toFixed(2)),
    potentialAnnualSavings: Number(potentialAnnualSavings.toFixed(2)),
    activeCount: activeSubs.filter(s => s.status === 'ACTIVE').length,
    trialCount: activeSubs.filter(s => s.status === 'TRIAL').length,
    flags,
    recommendations,
    duplicateCategories,
    unusedSubscriptions,
    priceHikeSubscriptions,
    expiringTrials,
  };
}
