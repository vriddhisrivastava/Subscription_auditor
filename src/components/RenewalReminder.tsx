import React, { useState } from 'react';
import { Subscription, RenewalAlert } from '../types/subscription';
import { getUpcomingRenewals, simulateSendEmailReminder } from '../lib/notifications';
import {
  Bell,
  Calendar,
  CreditCard,
  Mail,
  AlertCircle,
  Clock,
  CheckCircle2,
  Send,
} from 'lucide-react';

interface RenewalReminderProps {
  subscriptions: Subscription[];
  reminderDays: number;
  userEmail?: string;
  onUpdateReminderDays?: (days: number) => void;
  referenceDate?: string;
}

export const RenewalReminder: React.FC<RenewalReminderProps> = ({
  subscriptions,
  reminderDays = 3,
  userEmail = 'alex.rivera@example.com',
  onUpdateReminderDays,
  referenceDate = '2026-09-26',
}) => {
  const [activeTab, setActiveTab] = useState<'7DAYS' | '30DAYS'>('7DAYS');
  const [sentAlert, setSentAlert] = useState<{
    subject: string;
    body: string;
    sentAt: string;
    to: string;
  } | null>(null);

  const upcoming7 = getUpcomingRenewals(subscriptions, 7, referenceDate);
  const upcoming30 = getUpcomingRenewals(subscriptions, 30, referenceDate);

  const currentList = activeTab === '7DAYS' ? upcoming7 : upcoming30;

  const total7Amount = upcoming7.reduce((sum, item) => sum + item.amount, 0);
  const total30Amount = upcoming30.reduce((sum, item) => sum + item.amount, 0);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amt);
  };

  const handleTestEmail = (alert: RenewalAlert) => {
    const result = simulateSendEmailReminder({
      toEmail: userEmail,
      subscriptionName: alert.subscription.name,
      amount: alert.amount,
      currency: alert.subscription.currency,
      renewalDate: alert.renewalDate,
      daysRemaining: alert.daysRemaining,
      paymentMethod: alert.subscription.paymentMethod,
      isTrial: alert.subscription.status === 'TRIAL',
    });

    setSentAlert({
      subject: result.emailSubject,
      body: result.emailBody,
      sentAt: new Date().toLocaleTimeString(),
      to: userEmail,
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span>// DUE NEXT 7 DAYS</span>
            <Clock className="w-4 h-4 text-foreground" />
          </div>
          <div className="font-editorial text-3xl font-bold text-foreground mt-3">
            {formatCurrency(total7Amount)}
          </div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mt-2 pt-2 border-t border-border">
            {upcoming7.length} {upcoming7.length === 1 ? 'charge' : 'charges'} pending
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span>// DUE NEXT 30 DAYS</span>
            <Calendar className="w-4 h-4 text-foreground" />
          </div>
          <div className="font-editorial text-3xl font-bold text-foreground mt-3">
            {formatCurrency(total30Amount)}
          </div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mt-2 pt-2 border-t border-border">
            {upcoming30.length} scheduled renewals
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span>// NOTICE WINDOW</span>
            <Bell className="w-4 h-4 text-foreground" />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <select
              value={reminderDays}
              onChange={e => onUpdateReminderDays?.(parseInt(e.target.value, 10))}
              className="bg-background px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-full border border-border text-foreground focus:outline-hidden"
            >
              <option value={1}>1 day prior</option>
              <option value={2}>2 days prior</option>
              <option value={3}>3 days prior</option>
              <option value={5}>5 days prior</option>
              <option value={7}>7 days prior</option>
            </select>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-2 pt-2 border-t border-border truncate">
            Dispatched to: {userEmail}
          </div>
        </div>
      </div>

      {/* Renewal Timeline Section */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              // RECURRING CALENDAR
            </div>
            <h3 className="font-editorial text-2xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
              Renewal Timeline
            </h3>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
              Scheduled auto-debits and cancellation deadlines
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-full border border-border bg-background self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('7DAYS')}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                activeTab === '7DAYS'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Next 7 Days ({upcoming7.length})
            </button>
            <button
              onClick={() => setActiveTab('30DAYS')}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                activeTab === '30DAYS'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Next 30 Days ({upcoming30.length})
            </button>
          </div>
        </div>

        {/* List of upcoming renewals */}
        {currentList.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            No renewal charges scheduled within this time window.
          </div>
        ) : (
          <div className="divide-y divide-border/60 mt-2">
            {currentList.map(item => {
              const isTrial = item.subscription.status === 'TRIAL';
              return (
                <div
                  key={item.subscription.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 px-3 -mx-3 rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                        item.daysRemaining <= 2
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : item.daysRemaining <= 5
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-muted text-foreground border border-border'
                      }`}
                    >
                      {item.daysRemaining === 0 ? 'NOW' : `${item.daysRemaining}d`}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          {item.subscription.name}
                        </span>
                        {isTrial && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            Trial Ends
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.renewalDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          {item.subscription.paymentMethod}
                        </span>
                        <span>•</span>
                        <span className="capitalize">
                          {item.subscription.billingCycle.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-13 sm:pl-0">
                    <div className="text-right">
                      <div className="font-bold text-foreground text-base">
                        {formatCurrency(item.amount)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {item.daysRemaining === 0
                          ? 'Charging Today'
                          : item.daysRemaining === 1
                          ? 'Charging Tomorrow'
                          : `in ${item.daysRemaining} days`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleTestEmail(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted text-foreground transition-colors"
                      title="Send test renewal reminder email"
                    >
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span>Test Alert</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Simulated Email Modal / Dialog */}
      {sentAlert && (
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Simulated Email Alert Delivered to {sentAlert.to} at {sentAlert.sentAt}
            </span>
            <button
              onClick={() => setSentAlert(null)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Dismiss
            </button>
          </div>
          <div className="p-3 rounded-lg bg-background border border-border text-xs font-mono whitespace-pre-wrap text-foreground/90">
            <strong>Subject: {sentAlert.subject}</strong>
            {'\n\n'}
            {sentAlert.body}
          </div>
        </div>
      )}
    </div>
  );
};
