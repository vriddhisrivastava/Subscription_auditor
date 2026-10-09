import React, { useState } from 'react';
import { Recommendation, Subscription } from '../types/subscription';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingDown,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Scissors,
} from 'lucide-react';

interface CancelKeepListProps {
  recommendations: Recommendation[];
  subscriptions: Subscription[];
  onCancelSubscription: (subscriptionId: string) => void;
  onUpdateStatus?: (subscriptionId: string, status: any) => void;
}

export const CancelKeepList: React.FC<CancelKeepListProps> = ({
  recommendations,
  subscriptions,
  onCancelSubscription,
  onUpdateStatus,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CANCEL' | 'REVIEW' | 'KEEP'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const subMap = new Map(subscriptions.map(s => [s.id, s]));

  const filtered = recommendations.filter(r => {
    if (filter === 'ALL') return true;
    return r.decision === filter;
  });

  const cancelCount = recommendations.filter(r => r.decision === 'CANCEL').length;
  const reviewCount = recommendations.filter(r => r.decision === 'REVIEW').length;
  const keepCount = recommendations.filter(r => r.decision === 'KEEP').length;

  const totalPotentialSavings = recommendations
    .filter(r => r.decision === 'CANCEL')
    .reduce((sum, r) => sum + r.potentialAnnualSavings, 0);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amt);
  };

  const getBadge = (decision: 'CANCEL' | 'REVIEW' | 'KEEP') => {
    switch (decision) {
      case 'CANCEL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Recommended: CANCEL
          </span>
        );
      case 'REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Under Review
          </span>
        );
      case 'KEEP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Keep Active
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Value Prop */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden shadow-2xs">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
            <span>// DECISION PROTOCOL</span>
            <span>•</span>
            <span>( 2026 )</span>
          </div>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground mt-1">
            Cancel or Keep Matrix
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl font-sans leading-relaxed">
            Algorithmic recommendation engine balancing usage frequency, overlapping features, and price inflation to protect your capital.
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0 bg-background p-5 rounded-2xl border border-border shadow-2xs">
          <span className="font-mono text-[11px] block uppercase tracking-widest text-muted-foreground font-medium">
            Immediate Recoverable Savings
          </span>
          <span className="font-editorial text-3xl sm:text-4xl font-black text-foreground">
            {formatCurrency(totalPotentialSavings)}
            <span className="font-mono text-xs font-normal text-muted-foreground">/yr</span>
          </span>
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
            // Terminate {cancelCount} unnecessary services
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
            filter === 'ALL'
              ? 'bg-foreground text-background font-bold shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border'
          }`}
        >
          All Recs ({recommendations.length})
        </button>
        <button
          onClick={() => setFilter('CANCEL')}
          className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all inline-flex items-center gap-1.5 ${
            filter === 'CANCEL'
              ? 'bg-foreground text-background font-bold shadow-xs'
              : 'text-rose-700 dark:text-rose-400 hover:bg-card border border-transparent hover:border-border'
          }`}
        >
          <span>Cancel ({cancelCount})</span>
        </button>
        <button
          onClick={() => setFilter('REVIEW')}
          className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all inline-flex items-center gap-1.5 ${
            filter === 'REVIEW'
              ? 'bg-foreground text-background font-bold shadow-xs'
              : 'text-amber-700 dark:text-amber-300 hover:bg-card border border-transparent hover:border-border'
          }`}
        >
          <span>Under Review ({reviewCount})</span>
        </button>
        <button
          onClick={() => setFilter('KEEP')}
          className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all inline-flex items-center gap-1.5 ${
            filter === 'KEEP'
              ? 'bg-foreground text-background font-bold shadow-xs'
              : 'text-foreground hover:bg-card border border-transparent hover:border-border'
          }`}
        >
          <span>Keep ({keepCount})</span>
        </button>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        {filtered.map(rec => {
          const sub = subMap.get(rec.subscriptionId);
          const isExpanded = expandedId === rec.subscriptionId;

          return (
            <div
              key={rec.subscriptionId}
              className={`rounded-2xl border transition-all ${
                rec.decision === 'CANCEL'
                  ? 'border-rose-400/50 dark:border-rose-900/50 bg-rose-500/[0.02]'
                  : rec.decision === 'REVIEW'
                  ? 'border-amber-400/50 dark:border-amber-900/50 bg-amber-500/[0.02]'
                  : 'border-border bg-card'
              } p-4 sm:p-5 overflow-hidden`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Score Indicator */}
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                      rec.score < 40
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : rec.score < 65
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    <span className="text-base font-extrabold leading-none">{rec.score}</span>
                    <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5">
                      Score
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold text-foreground text-base">
                        {rec.subscriptionName}
                      </h4>
                      {getBadge(rec.decision)}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{formatCurrency(rec.monthlyCost)}/mo ({formatCurrency(rec.annualCost)}/yr)</span>
                      {rec.potentialAnnualSavings > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          • Potential saving: {formatCurrency(rec.potentialAnnualSavings)}/yr
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {rec.decision === 'CANCEL' && (
                    <button
                      onClick={() => onCancelSubscription(rec.subscriptionId)}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Cancel Subscription</span>
                    </button>
                  )}

                  {rec.decision === 'REVIEW' && (
                    <button
                      onClick={() => onCancelSubscription(rec.subscriptionId)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Pause or Cancel</span>
                    </button>
                  )}

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : rec.subscriptionId)}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    title="Toggle details"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Rationale & Reasons */}
              <div className="mt-4 pt-3 border-t border-border/60">
                <div className="text-xs font-semibold text-foreground mb-1.5">
                  Audit Findings & Reasoning:
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {rec.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Advice Box */}
                <div className="mt-3 p-3 rounded-xl bg-muted/50 border border-border/50 text-xs">
                  <span className="font-semibold text-foreground">Action Guidance: </span>
                  <span className="text-muted-foreground">{rec.actionRecommendation}</span>
                </div>
              </div>

              {/* Expanded Cancellation Guide & Link */}
              {isExpanded && sub && (
                <div className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground space-y-2">
                  <div className="font-semibold text-foreground">How to cancel:</div>
                  <p>
                    1. Sign in to your account at{' '}
                    {sub.websiteUrl ? (
                      <a
                        href={sub.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline inline-flex items-center gap-1"
                      >
                        {sub.websiteUrl} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      'the provider website'
                    )}
                    .
                  </p>
                  <p>2. Navigate to Account &gt; Subscriptions / Billing settings.</p>
                  <p>3. Select "{sub.name}" and click "Cancel Subscription" or "Disable Auto-renew".</p>
                  <p>4. Confirm cancellation before {sub.nextRenewalDate} to avoid the next charge.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
