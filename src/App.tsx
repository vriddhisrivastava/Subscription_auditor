/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Subscription,
  AuditSummary,
  UserProfile,
  SubscriptionCategory,
  SubscriptionStatus,
  CATEGORY_INFO,
} from './types/subscription';
import { api } from './lib/api';
import { generateRenewalNotifications, InAppNotification } from './lib/notifications';
import { DetectedSubscriptionItem } from './lib/csvParser';
import { Navbar, NavTab } from './components/Navbar';
import { SubscriptionCard } from './components/SubscriptionCard';
import { SpendChart } from './components/SpendChart';
import { RenewalReminder } from './components/RenewalReminder';
import { AuditFlag } from './components/AuditFlag';
import { CancelKeepList } from './components/CancelKeepList';
import { SubscriptionModal } from './components/SubscriptionModal';
import { CSVImportModal } from './components/CSVImportModal';
import { AuthModal, DEMO_PROFILES } from './components/AuthModal';
import {
  DollarSign,
  TrendingDown,
  Clock,
  Layers,
  Sparkles,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  CreditCard,
  Scissors,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  LogIn,
} from 'lucide-react';

const CURRENT_APP_DATE = '2026-09-26';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEMO_PROFILES[0]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Filters & Search for Subscriptions Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'COST_DESC' | 'COST_ASC' | 'RENEWAL_ASC' | 'LAST_USED' | 'NAME'>('RENEWAL_ASC');

  // Audit Threshold state
  const [unusedThresholdDays, setUnusedThresholdDays] = useState(30);

  // Fetch data
  const loadData = async (userId: string = currentUser?.id || 'usr_default_demo') => {
    setIsLoading(true);
    try {
      const subs = await api.subscriptions.list(userId);
      setSubscriptions(subs);
      const audit = await api.audit.run(unusedThresholdDays, userId);
      setAuditSummary(audit);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentUser?.id || 'usr_default_demo');
  }, [currentUser?.id, unusedThresholdDays]);

  // Notifications
  const notifications: InAppNotification[] = useMemo(() => {
    return generateRenewalNotifications(
      subscriptions,
      currentUser?.reminderDays || 3,
      CURRENT_APP_DATE
    );
  }, [subscriptions, currentUser?.reminderDays]);

  // Handlers
  const handleSaveSubscription = async (
    data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> => {
    const activeUserId = currentUser?.id || 'usr_default_demo';
    if (editingSubscription) {
      const res = await api.subscriptions.update(editingSubscription.id, data, activeUserId);
      if (res.data) {
        await loadData(activeUserId);
        return true;
      }
      return false;
    } else {
      const res = await api.subscriptions.create(
        { ...data, userId: activeUserId },
        activeUserId
      );
      if (res.data) {
        await loadData(activeUserId);
        return true;
      }
      return false;
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    const activeUserId = currentUser?.id || 'usr_default_demo';
    await api.subscriptions.delete(id, activeUserId);
    await loadData(activeUserId);
  };

  const handleMarkUsed = async (id: string) => {
    const activeUserId = currentUser?.id || 'usr_default_demo';
    await api.subscriptions.markUsed(id, CURRENT_APP_DATE, activeUserId);
    await loadData(activeUserId);
  };

  const handleResetSeed = async () => {
    const activeUserId = currentUser?.id || 'usr_default_demo';
    if (window.confirm('Reset all subscriptions back to original demo seed dataset?')) {
      await api.seed.reset(activeUserId);
      await loadData(activeUserId);
    }
  };

  const handleImportCSVItems = async (items: DetectedSubscriptionItem[]) => {
    const activeUserId = currentUser?.id || 'usr_default_demo';
    for (const item of items) {
      await api.subscriptions.create(
        {
          userId: activeUserId,
          name: item.name,
          category: item.category,
          cost: item.cost,
          currency: 'INR',
          billingCycle: item.billingCycle,
          nextRenewalDate: item.estimatedNextRenewal,
          paymentMethod: item.paymentMethod,
          status: 'ACTIVE',
          lastUsedDate: CURRENT_APP_DATE,
          previousCost: null,
          notes: `Imported from bank statement: ${item.rawMerchant}`,
        },
        activeUserId
      );
    }
    await loadData(activeUserId);
    setCurrentTab('subscriptions');
  };

  // Filtered & Sorted Subscriptions
  const filteredSubscriptions = useMemo(() => {
    let result = [...subscriptions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.notes?.toLowerCase().includes(q) ||
          s.paymentMethod.toLowerCase().includes(q)
      );
    }

    if (selectedCategoryFilter !== 'ALL') {
      result = result.filter(s => s.category === selectedCategoryFilter);
    }

    if (selectedStatusFilter !== 'ALL') {
      result = result.filter(s => s.status === selectedStatusFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'COST_DESC') return b.cost - a.cost;
      if (sortBy === 'COST_ASC') return a.cost - b.cost;
      if (sortBy === 'RENEWAL_ASC') {
        return new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime();
      }
      if (sortBy === 'LAST_USED') {
        const timeA = a.lastUsedDate ? new Date(a.lastUsedDate).getTime() : 0;
        const timeB = b.lastUsedDate ? new Date(b.lastUsedDate).getTime() : 0;
        return timeA - timeB; // least recently used first
      }
      if (sortBy === 'NAME') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [subscriptions, searchQuery, selectedCategoryFilter, selectedStatusFilter, sortBy]);

  const upcoming7Count = useMemo(() => {
    return subscriptions.filter(s => {
      if (s.status !== 'ACTIVE' && s.status !== 'TRIAL') return false;
      const d1 = new Date(CURRENT_APP_DATE).getTime();
      const d2 = new Date(s.nextRenewalDate).getTime();
      const days = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 7;
    }).length;
  }, [subscriptions]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20 max-w-full overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAddModal={() => {
          setEditingSubscription(null);
          setIsAddModalOpen(true);
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onResetSeed={handleResetSeed}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={() => setCurrentUser(null)}
        currentUser={currentUser}
        notifications={notifications}
        flagCount={auditSummary?.flags.length || 0}
        upcomingRenewalsCount={upcoming7Count}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 overflow-x-hidden">
        {/* Guest Banner if signed out */}
        {!currentUser && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-foreground text-background font-mono font-bold flex items-center justify-center text-xs shrink-0">
                <LogIn className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-foreground block sm:inline">
                  // GUEST ARCHIVE MODE
                </span>
                <span className="text-muted-foreground ml-0 sm:ml-2">
                  Select a persona profile (Soumya, Aanya, Rohan) to inspect personalized recurring accounts.
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-full border border-foreground bg-foreground text-background font-mono text-[11px] uppercase tracking-wider font-bold shrink-0 shadow-2xs flex items-center gap-1.5 self-start sm:self-auto hover:opacity-90 transition-opacity"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Select Profile</span>
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-20 text-center text-muted-foreground">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent mb-3" />
            <p className="text-sm">Auditing subscription portfolio...</p>
          </div>
        )}

        {!isLoading && auditSummary && (
          <>
            {/* VIEW 1: DASHBOARD */}
            {currentTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Vintage Modern Architectural Hero Banner */}
                <div className="border border-border bg-card p-6 sm:p-10 rounded-2xl relative overflow-hidden shadow-sm">
                  <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-6 border-b border-border">
                    <div className="max-w-3xl">
                      <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                        <span>&#123; ARCHITECTURAL AUDIT &#125;</span>
                        <span>•</span>
                        <span>( 2026 )</span>
                      </div>
                      <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight text-foreground leading-[0.95]">
                        Vintage Look <br />
                        <span className="text-foreground/90">Modern Build</span>
                      </h1>
                      <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl font-sans uppercase tracking-wider leading-relaxed">
                        We’re not just tracking recurring costs. We’re eliminating wasteful subscriptions, protecting your cashflow, and auditing liabilities.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                      <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="px-5 py-3 rounded-full border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Scan Statement CSV</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingSubscription(null);
                          setIsAddModalOpen(true);
                        }}
                        className="px-6 py-3 rounded-full bg-foreground text-background hover:opacity-90 text-xs font-bold uppercase tracking-wider transition-opacity inline-flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Subscription</span>
                      </button>
                    </div>
                  </div>

                  {/* Editorial Quotation bar */}
                  <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground gap-2">
                    <span>// RECURRING EXPENSE INTELLIGENCE & CAPITAL PRESERVATION</span>
                    <span>ACTIVE PLANS: {subscriptions.length}</span>
                  </div>
                </div>

                {/* 4 Key Stat Cards with Editorial Styling */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Monthly Spend */}
                  <div className="p-6 rounded-2xl border border-border bg-card shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        <span>// MONTHLY SPEND</span>
                        <span className="font-bold text-foreground">₹</span>
                      </div>
                      <div className="font-editorial text-3xl sm:text-4xl font-black text-foreground mt-3 tracking-tight">
                        ₹{auditSummary.totalMonthlySpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mt-3 pt-3 border-t border-border">
                      ₹{auditSummary.totalYearlySpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })} annualized
                    </div>
                  </div>

                  {/* Potential Annual Savings */}
                  <div className="p-6 rounded-2xl border border-border bg-card shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        <span>// CAPITAL RECOVERABLE</span>
                        <Sparkles className="w-4 h-4 text-foreground" />
                      </div>
                      <div className="font-editorial text-3xl sm:text-4xl font-black text-foreground mt-3 tracking-tight">
                        ₹{auditSummary.potentialAnnualSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mt-3 pt-3 border-t border-border">
                      Recoverable yearly savings
                    </div>
                  </div>

                  {/* Audit Flags Count */}
                  <div
                    onClick={() => setCurrentTab('audit')}
                    className="p-6 rounded-2xl border border-border bg-card shadow-2xs cursor-pointer hover:border-foreground transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        <span>// AUDIT FLAGS</span>
                        <AlertTriangle className="w-4 h-4 text-foreground" />
                      </div>
                      <div className="font-editorial text-3xl sm:text-4xl font-black text-foreground mt-3 tracking-tight">
                        {auditSummary.flags.length}
                      </div>
                    </div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-foreground mt-3 pt-3 border-t border-border flex items-center justify-between">
                      <span>Inspect anomalies</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Upcoming Renewals in 7 Days */}
                  <div
                    onClick={() => setCurrentTab('renewals')}
                    className="p-6 rounded-2xl border border-border bg-card shadow-2xs cursor-pointer hover:border-foreground transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        <span>// DUE 7 DAYS</span>
                        <Calendar className="w-4 h-4 text-foreground" />
                      </div>
                      <div className="font-editorial text-3xl sm:text-4xl font-black text-foreground mt-3 tracking-tight">
                        {upcoming7Count}
                      </div>
                    </div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-foreground mt-3 pt-3 border-t border-border flex items-center justify-between">
                      <span>Review schedule</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Priority Audit Banner if flags exist */}
                {auditSummary.flags.length > 0 && (
                  <div className="rounded-2xl border border-foreground bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="p-3 rounded-full bg-foreground text-background shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                            // ATTENTION REQUIRED
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                            {auditSummary.flags.length} optimization points
                          </span>
                        </div>
                        <h3 className="font-editorial text-xl sm:text-2xl font-bold uppercase text-foreground mt-1 truncate">
                          {auditSummary.flags[0].title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                          {auditSummary.flags[0].message}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <button
                        onClick={() => setCurrentTab('cancel_keep')}
                        className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-foreground text-background hover:opacity-90 transition-opacity shadow-xs"
                      >
                        Cancel or Keep Matrix
                      </button>
                      <button
                        onClick={() => setCurrentTab('audit')}
                        className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border border-border hover:border-foreground text-foreground transition-colors"
                      >
                        View All Flags
                      </button>
                    </div>
                  </div>
                )}

                {/* Spend Distribution Chart */}
                <SpendChart subscriptions={subscriptions} currency={currentUser?.currency || 'INR'} />

                {/* Upcoming Renewals Snippet + Cancel/Keep Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upcoming Charges Preview */}
                  <div className="p-6 rounded-2xl border border-border bg-card shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <h3 className="font-bold text-foreground text-base">
                          Upcoming Renewals (Next 7 Days)
                        </h3>
                      </div>
                      <button
                        onClick={() => setCurrentTab('renewals')}
                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <span>Full Schedule</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="divide-y divide-border/60">
                      {subscriptions
                        .filter(s => s.status === 'ACTIVE' || s.status === 'TRIAL')
                        .sort(
                          (a, b) =>
                            new Date(a.nextRenewalDate).getTime() -
                            new Date(b.nextRenewalDate).getTime()
                        )
                        .slice(0, 4)
                        .map(sub => (
                          <div
                            key={sub.id}
                            className="py-3 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-foreground truncate block">
                                {sub.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                Due {sub.nextRenewalDate} via {sub.paymentMethod}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-foreground block">
                                ₹{sub.cost.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-muted-foreground capitalize">
                                {sub.billingCycle.toLowerCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Cancel or Keep Quick Recs */}
                  <div className="p-6 rounded-2xl border border-border bg-card shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Scissors className="w-5 h-5 text-rose-500" />
                        <h3 className="font-bold text-foreground text-base">
                          Recommended to Cancel
                        </h3>
                      </div>
                      <button
                        onClick={() => setCurrentTab('cancel_keep')}
                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <span>View Decision Matrix</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="divide-y divide-border/60">
                      {auditSummary.recommendations
                        .filter(r => r.decision === 'CANCEL')
                        .slice(0, 3)
                        .map(rec => (
                          <div
                            key={rec.subscriptionId}
                            className="py-3 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground truncate">
                                  {rec.subscriptionName}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600">
                                  Score {rec.score}
                                </span>
                              </div>
                              <span className="text-[11px] text-muted-foreground truncate block mt-0.5">
                                {rec.reasons[0] || 'Low engagement'}
                              </span>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                                +₹{rec.potentialAnnualSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/yr
                              </span>
                              <button
                                onClick={() => handleDeleteSubscription(rec.subscriptionId)}
                                className="text-[10px] text-rose-600 hover:underline mt-0.5 block"
                              >
                                Cancel Service
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: SUBSCRIPTIONS */}
            {currentTab === 'subscriptions' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
                      // ACTIVE REGISTRY
                    </div>
                    <h1 className="font-editorial text-3xl sm:text-4xl font-bold uppercase tracking-tight text-foreground">
                      All Subscriptions
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                      Inventory of recurring vendor commitments and billing schedules
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsImportModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:border-foreground text-xs font-mono uppercase tracking-wider text-foreground transition-colors shadow-2xs"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Upload CSV</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingSubscription(null);
                        setIsAddModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-foreground text-background text-xs font-mono uppercase tracking-wider font-bold hover:opacity-90 transition-opacity shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Subscription</span>
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search plan name..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-full border border-border bg-background text-foreground focus:outline-hidden focus:border-foreground"
                      />
                    </div>

                    {/* Category Filter */}
                    <div>
                      <select
                        value={selectedCategoryFilter}
                        onChange={e => setSelectedCategoryFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-full border border-border bg-background text-foreground focus:outline-hidden focus:border-foreground"
                      >
                        <option value="ALL">All Categories</option>
                        {Object.entries(CATEGORY_INFO).map(([cat, info]) => (
                          <option key={cat} value={cat}>
                            {info.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <select
                        value={selectedStatusFilter}
                        onChange={e => setSelectedStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-full border border-border bg-background text-foreground focus:outline-hidden focus:border-foreground"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active Only</option>
                        <option value="TRIAL">Free Trials</option>
                        <option value="PAUSED">Paused</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>

                    {/* Sort By */}
                    <div>
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-full border border-border bg-background text-foreground focus:outline-hidden focus:border-foreground"
                      >
                        <option value="RENEWAL_ASC">Renewing Soonest</option>
                        <option value="COST_DESC">Price: High to Low</option>
                        <option value="COST_ASC">Price: Low to High</option>
                        <option value="LAST_USED">Least Recently Used</option>
                        <option value="NAME">Name (A-Z)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground pt-2 border-t border-border">
                    <span>
                      // Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
                    </span>
                    {(searchQuery || selectedCategoryFilter !== 'ALL' || selectedStatusFilter !== 'ALL') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategoryFilter('ALL');
                          setSelectedStatusFilter('ALL');
                        }}
                        className="text-foreground hover:underline font-bold"
                      >
                        [ Clear Filters ]
                      </button>
                    )}
                  </div>
                </div>

                {/* Subscriptions Grid */}
                {filteredSubscriptions.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card">
                    <p className="text-sm font-semibold text-foreground">
                      No matching subscriptions found.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search query or clear filters.
                    </p>
                    <button
                      onClick={() => {
                        setEditingSubscription(null);
                        setIsAddModalOpen(true);
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Subscription</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSubscriptions.map(sub => (
                      <SubscriptionCard
                        key={sub.id}
                        subscription={sub}
                        onEdit={s => {
                          setEditingSubscription(s);
                          setIsAddModalOpen(true);
                        }}
                        onDelete={handleDeleteSubscription}
                        onMarkUsed={handleMarkUsed}
                        referenceDate={CURRENT_APP_DATE}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: AUDIT FLAGS */}
            {currentTab === 'audit' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
                      // INTELLIGENCE & HEURISTICS
                    </div>
                    <h1 className="font-editorial text-3xl sm:text-4xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
                      Smart Audit & Insights
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                      Automated diagnostics: inactivity decay, redundancy collision, and tariff increases
                    </p>
                  </div>

                  {/* Threshold Settings */}
                  <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border text-xs shadow-2xs">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Inactivity threshold:</span>
                    <select
                      value={unusedThresholdDays}
                      onChange={e => setUnusedThresholdDays(parseInt(e.target.value, 10))}
                      className="bg-background px-3 py-1 rounded-full font-mono text-xs font-bold text-foreground focus:outline-hidden border border-border"
                    >
                      <option value={15}>15 days</option>
                      <option value={30}>30 days (default)</option>
                      <option value={45}>45 days</option>
                      <option value={60}>60 days</option>
                    </select>
                  </div>
                </div>

                {/* Audit Highlights Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                    <span className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold block">
                      Duplicate Apps
                    </span>
                    <span className="text-2xl font-black text-foreground mt-1 block">
                      {auditSummary.duplicateCategories.length}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Multiple apps in same category
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
                    <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold block">
                      Inactive Apps
                    </span>
                    <span className="text-2xl font-black text-foreground mt-1 block">
                      {auditSummary.unusedSubscriptions.length}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Not used in {unusedThresholdDays}+ days
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold block">
                      Price Hikes
                    </span>
                    <span className="text-2xl font-black text-foreground mt-1 block">
                      {auditSummary.priceHikeSubscriptions.length}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Costs increased recently
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
                    <span className="text-xs text-purple-700 dark:text-purple-400 font-semibold block">
                      Trial Ending
                    </span>
                    <span className="text-2xl font-black text-foreground mt-1 block">
                      {auditSummary.expiringTrials.length}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Charges starting soon
                    </span>
                  </div>
                </div>

                {/* Flag List */}
                {auditSummary.flags.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl border border-border bg-card">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-foreground">
                      Zero Audit Issues Found!
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      All your subscriptions are actively used, have no duplicate categories, and no
                      imminent trial surprises.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {auditSummary.flags.map(flag => (
                      <AuditFlag
                        key={flag.id}
                        flag={flag}
                        onCancelSubscription={handleDeleteSubscription}
                        onMarkUsed={handleMarkUsed}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 4: CANCEL OR KEEP */}
            {currentTab === 'cancel_keep' && (
              <CancelKeepList
                recommendations={auditSummary.recommendations}
                subscriptions={subscriptions}
                onCancelSubscription={handleDeleteSubscription}
              />
            )}

            {/* VIEW 5: RENEWALS TIMELINE */}
            {currentTab === 'renewals' && (
              <RenewalReminder
                subscriptions={subscriptions}
                reminderDays={currentUser?.reminderDays || 3}
                userEmail={currentUser?.email || 'soumyanamboori@gmail.com'}
                referenceDate={CURRENT_APP_DATE}
                onUpdateReminderDays={days => {
                  setCurrentUser(prev => (prev ? { ...prev, reminderDays: days } : null));
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <SubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSubscription(null);
        }}
        onSave={handleSaveSubscription}
        subscription={editingSubscription}
      />

      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportCSVItems}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={user => {
          setCurrentUser(user);
          loadData(user.id);
        }}
        onLogout={() => {
          setCurrentUser(null);
        }}
      />
    </div>
  );
}
