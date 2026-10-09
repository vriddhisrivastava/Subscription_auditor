import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Subscription, AuditSummary } from '../../types/subscription';
import { SpendChart } from '../../components/SpendChart';
import { RenewalReminder } from '../../components/RenewalReminder';
import { DollarSign, Sparkles, AlertTriangle, Calendar, Plus } from 'lucide-react';

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);

  useEffect(() => {
    async function load() {
      const subs = await api.subscriptions.list();
      const audit = await api.audit.run(30);
      setSubscriptions(subs);
      setAuditSummary(audit);
    }
    load();
  }, []);

  if (!auditSummary) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1">Overview of recurring subscription finances</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-xs text-muted-foreground">Monthly Spend</span>
          <div className="text-2xl font-bold mt-1">₹{auditSummary.totalMonthlySpend.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <span className="text-xs text-emerald-600 font-semibold">Annual Savings</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            ₹{auditSummary.potentialAnnualSavings.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <span className="text-xs text-amber-600 font-semibold">Audit Flags</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{auditSummary.flags.length}</div>
        </div>
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
          <span className="text-xs text-blue-600 font-semibold">Active Services</span>
          <div className="text-2xl font-bold mt-1">{auditSummary.activeCount}</div>
        </div>
      </div>

      <SpendChart subscriptions={subscriptions} />
      <RenewalReminder subscriptions={subscriptions} reminderDays={3} />
    </div>
  );
}
