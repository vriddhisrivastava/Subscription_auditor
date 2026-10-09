import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { AuditSummary, Subscription } from '../../../types/subscription';
import { AuditFlag } from '../../../components/AuditFlag';
import { CancelKeepList } from '../../../components/CancelKeepList';

export default function AuditPage() {
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const load = async () => {
    const audit = await api.audit.run(30);
    const subs = await api.subscriptions.list();
    setAuditSummary(audit);
    setSubscriptions(subs);
  };

  useEffect(() => {
    load();
  }, []);

  if (!auditSummary) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Running audit engine...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit & Recommendations</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Identified {auditSummary.flags.length} potential cost leaks with ₹{auditSummary.potentialAnnualSavings.toLocaleString('en-IN', { maximumFractionDigits: 2 })}/yr in savings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {auditSummary.flags.map(flag => (
          <AuditFlag
            key={flag.id}
            flag={flag}
            onCancelSubscription={async id => {
              await api.subscriptions.delete(id);
              load();
            }}
            onMarkUsed={async id => {
              await api.subscriptions.markUsed(id);
              load();
            }}
          />
        ))}
      </div>

      <CancelKeepList
        recommendations={auditSummary.recommendations}
        subscriptions={subscriptions}
        onCancelSubscription={async id => {
          await api.subscriptions.delete(id);
          load();
        }}
      />
    </div>
  );
}
