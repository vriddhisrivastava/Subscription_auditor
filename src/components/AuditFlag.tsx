import React from 'react';
import { AuditFlag as AuditFlagType } from '../types/subscription';
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  Layers,
  Sparkles,
  ArrowRight,
  DollarSign,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface AuditFlagProps {
  flag: AuditFlagType;
  onCancelSubscription: (subscriptionId: string) => void;
  onMarkUsed: (subscriptionId: string) => void;
  onDismiss?: (flagId: string) => void;
}

export const AuditFlag: React.FC<AuditFlagProps> = ({
  flag,
  onCancelSubscription,
  onMarkUsed,
  onDismiss,
}) => {
  const getFlagIcon = () => {
    switch (flag.type) {
      case 'DUPLICATE_CATEGORY':
        return <Layers className="w-5 h-5 text-indigo-500" />;
      case 'UNUSED_SERVICE':
        return <Clock className="w-5 h-5 text-rose-500" />;
      case 'PRICE_INCREASE':
        return <TrendingUp className="w-5 h-5 text-amber-500" />;
      case 'TRIAL_EXPIRING':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  const getSeverityStyle = () => {
    switch (flag.severity) {
      case 'HIGH':
        return 'border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-400';
      case 'MEDIUM':
        return 'border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400';
      default:
        return 'border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-400';
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-2xs hover:border-foreground transition-all flex flex-col justify-between gap-5">
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-foreground text-background shrink-0">
              {getFlagIcon()}
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                [ {flag.severity} PRIORITY ]
              </span>
              <h4 className="font-editorial text-lg sm:text-xl font-bold uppercase tracking-tight text-foreground mt-0.5">
                {flag.title}
              </h4>
            </div>
          </div>

          {/* Potential Savings Badge */}
          {flag.potentialAnnualSaving > 0 && (
            <div className="text-right shrink-0">
              <span className="font-mono text-[10px] uppercase tracking-widest block text-muted-foreground">
                RECOVER
              </span>
              <span className="font-editorial text-lg sm:text-xl font-black text-foreground">
                ₹{flag.potentialAnnualSaving.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                <span className="font-mono text-[10px] text-muted-foreground font-normal">/yr</span>
              </span>
            </div>
          )}
        </div>

        {/* Message */}
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">
          {flag.message}
        </p>

        {/* Suggested Action */}
        <div className="mt-4 p-3 rounded-xl bg-background border border-border text-xs flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground font-bold shrink-0">
            // ADVICE:
          </span>
          <span className="text-muted-foreground">{flag.suggestedAction}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border text-xs">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          // Target: {flag.subscriptionName}
        </span>

        <div className="flex items-center gap-2 ml-auto">
          {flag.type === 'UNUSED_SERVICE' && (
            <button
              onClick={() => onMarkUsed(flag.subscriptionId)}
              className="px-3.5 py-1.5 rounded-full border border-border bg-background hover:bg-card text-foreground font-mono text-[11px] uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Used Today</span>
            </button>
          )}

          <button
            onClick={() => onCancelSubscription(flag.subscriptionId)}
            className="px-4 py-1.5 rounded-full bg-foreground text-background font-mono text-[11px] uppercase tracking-wider hover:opacity-90 font-bold transition-opacity inline-flex items-center gap-1.5 shadow-2xs"
          >
            <span>Cancel Service</span>
          </button>
        </div>
      </div>
    </div>
  );
};
