import React from 'react';
import {
  Subscription,
  CATEGORY_INFO,
  calculateMonthlyCost,
  formatCurrency,
} from '../types/subscription';
import { getDaysDifference, formatDaysAgo } from '../lib/auditEngine';
import {
  Calendar,
  CreditCard,
  Clock,
  TrendingUp,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
} from 'lucide-react';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onMarkUsed: (id: string) => void;
  referenceDate?: string;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
  onDelete,
  onMarkUsed,
  referenceDate = '2026-09-26',
}) => {
  const cat = CATEGORY_INFO[subscription.category] || CATEGORY_INFO.OTHER;
  const daysUntilRenewal = getDaysDifference(referenceDate, subscription.nextRenewalDate);
  const monthlyCost = calculateMonthlyCost(subscription.cost, subscription.billingCycle);

  const daysSinceUsed = subscription.lastUsedDate
    ? getDaysDifference(subscription.lastUsedDate, referenceDate)
    : null;

  const isUnused = daysSinceUsed !== null && daysSinceUsed >= 30;
  const isTrial = subscription.status === 'TRIAL';
  const isRenewalSoon = daysUntilRenewal >= 0 && daysUntilRenewal <= 5;

  const displayCurrency = (amt: number) => {
    return formatCurrency(amt, subscription.currency || 'INR');
  };

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'TRIAL':
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300 font-bold">
            [ TRIAL ]
          </span>
        );
      case 'PAUSED':
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
            [ PAUSED ]
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-400 font-bold">
            [ CANCELLED ]
          </span>
        );
      default:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider text-foreground font-bold">
            [ ACTIVE ]
          </span>
        );
    }
  };

  return (
    <div
      className={`group relative rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-foreground shadow-2xs ${
        isTrial
          ? 'border-amber-700/60'
          : isUnused
          ? 'border-rose-700/60'
          : ''
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 font-mono text-xs">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {cat.label}
            </span>
            <span>•</span>
            {getStatusBadge()}
          </div>
          <h3 className="font-editorial text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground truncate flex items-center gap-2">
            {subscription.name}
            {subscription.websiteUrl && (
              <a
                href={subscription.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground inline-flex opacity-0 group-hover:opacity-100 transition-opacity"
                title="Visit website"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </h3>
        </div>

        {/* Cost & Cycle */}
        <div className="text-right shrink-0">
          <div className="font-editorial text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {displayCurrency(subscription.cost)}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            per {subscription.billingCycle.toLowerCase()}
          </div>
          {subscription.billingCycle !== 'MONTHLY' && (
            <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
              ≈ {displayCurrency(monthlyCost)}/mo
            </div>
          )}
        </div>
      </div>

      {/* Warnings / Badges */}
      <div className="space-y-1.5 mb-4">
        {subscription.previousCost && subscription.cost > subscription.previousCost && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span>
              Price increased from {displayCurrency(subscription.previousCost)} (+
              {Math.round(((subscription.cost - subscription.previousCost) / subscription.previousCost) * 100)}%)
            </span>
          </div>
        )}

        {isTrial && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-md font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Converts to paid {daysUntilRenewal <= 0 ? 'today' : `in ${daysUntilRenewal} days`} ({subscription.nextRenewalDate})
            </span>
          </div>
        )}

        {isUnused && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>
              Inactive for {daysSinceUsed} days ({displayCurrency(monthlyCost * 12)}/yr potential saving)
            </span>
          </div>
        )}
      </div>

      {/* Details Row */}
      <div className="grid grid-cols-2 gap-2 py-3 border-t border-b border-border/60 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-3.5 h-3.5 shrink-0 text-muted-foreground/80" />
          <div className="truncate">
            <span className="text-[10px] block uppercase tracking-wider text-muted-foreground/70">Next Charge</span>
            <span
              className={`font-medium ${
                isRenewalSoon ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-foreground'
              }`}
            >
              {subscription.nextRenewalDate}
              {daysUntilRenewal >= 0 && (
                <span className="ml-1 text-[11px] opacity-80">
                  ({daysUntilRenewal === 0 ? 'Today' : `${daysUntilRenewal}d`})
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <CreditCard className="w-3.5 h-3.5 shrink-0 text-muted-foreground/80" />
          <div className="truncate">
            <span className="text-[10px] block uppercase tracking-wider text-muted-foreground/70">Payment</span>
            <span className="font-medium text-foreground truncate block">
              {subscription.paymentMethod || 'Default Card'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Usage & Actions */}
      <div className="flex items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Last used:</span>
          {daysSinceUsed !== null ? (
            <span
              className={`font-medium ${
                daysSinceUsed <= 7
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : daysSinceUsed <= 25
                  ? 'text-foreground'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatDaysAgo(daysSinceUsed)}
            </span>
          ) : (
            <span className="text-muted-foreground italic">Never logged</span>
          )}
          <button
            onClick={() => onMarkUsed(subscription.id)}
            title="Mark as used today"
            className="ml-1 p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors inline-flex items-center gap-1 text-[11px]"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span className="hidden sm:inline">Used today</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(subscription)}
            className="px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors inline-flex items-center gap-1 text-[11px]"
            title="Edit subscription"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to remove "${subscription.name}"?`)) {
                onDelete(subscription.id);
              }
            }}
            className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors"
            title="Delete subscription"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
