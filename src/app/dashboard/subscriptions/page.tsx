import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { Subscription } from '../../../types/subscription';
import { SubscriptionCard } from '../../../components/SubscriptionCard';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const load = async () => {
    const list = await api.subscriptions.list();
    setSubscriptions(list);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage and audit your active recurring subscriptions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map(sub => (
          <SubscriptionCard
            key={sub.id}
            subscription={sub}
            onEdit={() => {}}
            onDelete={async id => {
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
    </div>
  );
}
