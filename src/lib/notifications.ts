import { Subscription, RenewalAlert } from '../types/subscription';
import { getDaysDifference } from './auditEngine';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'renewal' | 'trial' | 'price' | 'audit' | 'email_sent';
  timestamp: string;
  isRead: boolean;
  subscriptionId?: string;
  actionUrl?: string;
}

export function getUpcomingRenewals(
  subscriptions: Subscription[],
  horizonDays: number = 30,
  referenceDate: string = '2026-09-26'
): RenewalAlert[] {
  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE' || s.status === 'TRIAL');

  const alerts: RenewalAlert[] = [];

  for (const sub of activeSubs) {
    const days = getDaysDifference(referenceDate, sub.nextRenewalDate);
    if (days >= 0 && days <= horizonDays) {
      alerts.push({
        subscription: sub,
        daysRemaining: days,
        renewalDate: sub.nextRenewalDate,
        amount: sub.cost,
        isToday: days === 0,
        isUrgent: days <= 3,
      });
    }
  }

  // Sort by earliest renewal date first
  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function generateRenewalNotifications(
  subscriptions: Subscription[],
  userReminderDays: number = 3,
  referenceDate: string = '2026-09-26'
): InAppNotification[] {
  const upcoming = getUpcomingRenewals(subscriptions, userReminderDays, referenceDate);
  const notifications: InAppNotification[] = [];

  upcoming.forEach(item => {
    const isTrial = item.subscription.status === 'TRIAL';
    const dayText =
      item.daysRemaining === 0
        ? 'TODAY'
        : item.daysRemaining === 1
        ? 'TOMORROW'
        : `in ${item.daysRemaining} days`;

    notifications.push({
      id: `notif_${item.subscription.id}_${item.daysRemaining}`,
      title: isTrial
        ? `Free Trial Ending ${dayText}: ${item.subscription.name}`
        : `Upcoming Renewal ${dayText}: ${item.subscription.name}`,
      message: isTrial
        ? `Your trial converts into a paid ${item.subscription.billingCycle.toLowerCase()} charge of ₹${item.amount.toFixed(2)} on ${item.renewalDate}.`
        : `Scheduled charge of ₹${item.amount.toFixed(2)} via ${item.subscription.paymentMethod} on ${item.renewalDate}.`,
      type: isTrial ? 'trial' : 'renewal',
      timestamp: new Date().toISOString(),
      isRead: false,
      subscriptionId: item.subscription.id,
    });
  });

  return notifications;
}

export interface EmailReminderPayload {
  toEmail: string;
  subscriptionName: string;
  amount: number;
  currency: string;
  renewalDate: string;
  daysRemaining: number;
  paymentMethod: string;
  isTrial: boolean;
}

export function simulateSendEmailReminder(payload: EmailReminderPayload): {
  success: boolean;
  sentAt: string;
  emailSubject: string;
  emailBody: string;
} {
  const subject = payload.isTrial
    ? `⚠️ Action Required: ${payload.subscriptionName} Free Trial Ends in ${payload.daysRemaining} Days`
    : `💳 Renewal Alert: ${payload.subscriptionName} renews on ${payload.renewalDate} (₹${payload.amount.toFixed(2)})`;

  const body = `
Hello,

This is a scheduled alert from Subscription Auditor.

Service: ${payload.subscriptionName}
Amount: ₹${payload.amount.toFixed(2)} (${payload.currency || 'INR'})
Charge Date: ${payload.renewalDate} (${payload.daysRemaining === 0 ? 'Today' : `in ${payload.daysRemaining} days`})
Payment Method: ${payload.paymentMethod}
Status: ${payload.isTrial ? 'Free Trial Converting to Recurring Paid' : 'Active Subscription Renewal'}

Tip: If you do not plan to continue using this service, cancel it before the renewal date to avoid unwanted charges.
  `.trim();

  return {
    success: true,
    sentAt: new Date().toISOString(),
    emailSubject: subject,
    emailBody: body,
  };
}
