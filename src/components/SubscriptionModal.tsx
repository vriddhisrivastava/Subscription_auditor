import React, { useState, useEffect } from 'react';
import {
  Subscription,
  SubscriptionCategory,
  BillingCycle,
  SubscriptionStatus,
  CATEGORY_INFO,
} from '../types/subscription';
import { validateSubscriptionInput } from '../lib/db';
import { X, Calendar, DollarSign, Tag, CreditCard, Clock, Globe, FileText, AlertCircle } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  subscription?: Subscription | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subscription,
}) => {
  const isEditing = !!subscription;

  const [formData, setFormData] = useState<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>({
    userId: 'usr_default_demo',
    name: '',
    category: 'STREAMING_VIDEO',
    cost: 499,
    currency: 'INR',
    billingCycle: 'MONTHLY',
    nextRenewalDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI Autopay (GPay)',
    status: 'ACTIVE',
    lastUsedDate: new Date().toISOString().split('T')[0],
    trialEndsDate: null,
    previousCost: null,
    notes: '',
    websiteUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subscription) {
      setFormData({
        userId: subscription.userId,
        name: subscription.name,
        category: subscription.category,
        cost: subscription.cost,
        currency: subscription.currency || 'INR',
        billingCycle: subscription.billingCycle,
        nextRenewalDate: subscription.nextRenewalDate.split('T')[0],
        paymentMethod: subscription.paymentMethod,
        status: subscription.status,
        lastUsedDate: subscription.lastUsedDate ? subscription.lastUsedDate.split('T')[0] : '',
        trialEndsDate: subscription.trialEndsDate ? subscription.trialEndsDate.split('T')[0] : '',
        previousCost: subscription.previousCost ?? null,
        notes: subscription.notes || '',
        websiteUrl: subscription.websiteUrl || '',
      });
    } else {
      // Default new subscription values
      setFormData({
        userId: 'usr_default_demo',
        name: '',
        category: 'STREAMING_VIDEO',
        cost: 499,
        currency: 'INR',
        billingCycle: 'MONTHLY',
        nextRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: 'HDFC Regalia •••• 4821',
        status: 'ACTIVE',
        lastUsedDate: new Date().toISOString().split('T')[0],
        trialEndsDate: null,
        previousCost: null,
        notes: '',
        websiteUrl: '',
      });
    }
    setErrors({});
  }, [subscription, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateSubscriptionInput(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSave({
        ...formData,
        cost: Number(formData.cost),
        previousCost: formData.previousCost ? Number(formData.previousCost) : null,
      });
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 sm:p-8 overflow-hidden my-8 z-10 text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              // RECURRING COMMITMENT ENTRY
            </div>
            <h3 className="font-editorial text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground">
              {isEditing ? 'Modify Subscription' : 'Add Subscription'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter subscription details for automated cost and audit tracking
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
              Service Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Netflix, Spotify, GitHub Copilot"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-primary ${
                errors.name ? 'border-rose-500' : 'border-zinc-300 dark:border-zinc-700'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={e =>
                  setFormData({ ...formData, category: e.target.value as SubscriptionCategory })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={e =>
                  setFormData({ ...formData, status: e.target.value as SubscriptionStatus })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="ACTIVE">Active</option>
                <option value="TRIAL">Free Trial</option>
                <option value="PAUSED">Paused</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Cost & Billing Cycle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                Cost <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-zinc-400 font-medium">₹</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  placeholder="499"
                  value={formData.cost}
                  onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  className={`w-full pl-7 pr-3 py-2 text-sm rounded-lg border bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-primary ${
                    errors.cost ? 'border-rose-500' : 'border-zinc-300 dark:border-zinc-700'
                  }`}
                />
              </div>
              {errors.cost && <p className="text-xs text-rose-500 mt-1">{errors.cost}</p>}
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                Billing Cycle
              </label>
              <select
                value={formData.billingCycle}
                onChange={e =>
                  setFormData({ ...formData, billingCycle: e.target.value as BillingCycle })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="BIANNUAL">Biannual</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                Previous Cost (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-zinc-400 font-medium">₹</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="e.g. 399"
                  value={formData.previousCost ?? ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      previousCost: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Next Renewal Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                Next Renewal Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.nextRenewalDate}
                onChange={e => setFormData({ ...formData, nextRenewalDate: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
              {errors.nextRenewalDate && (
                <p className="text-xs text-rose-500 mt-1">{errors.nextRenewalDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                Payment Method
              </label>
              <input
                type="text"
                placeholder="e.g. Chase Visa, Apple Card"
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Last Used Date & Trial Ends Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                Last Used Date
              </label>
              <input
                type="date"
                value={formData.lastUsedDate || ''}
                onChange={e => setFormData({ ...formData, lastUsedDate: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Audit flags subscriptions unused for 30+ days
              </span>
            </div>

            {formData.status === 'TRIAL' ? (
              <div>
                <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                  Trial Conversion Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.trialEndsDate || formData.nextRenewalDate}
                  onChange={e => setFormData({ ...formData, trialEndsDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-amber-500/50 bg-amber-500/10 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                  Website / Login URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.websiteUrl || ''}
                  onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Shared with roommates, annual plan promo rate"
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider font-bold rounded-full border border-border hover:border-foreground text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-mono uppercase tracking-wider font-bold rounded-full bg-foreground text-background hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : isEditing ? 'Update Plan' : 'Confirm Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
