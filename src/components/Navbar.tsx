import React, { useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  CreditCard,
  AlertTriangle,
  Scissors,
  Calendar,
  FileSpreadsheet,
  Plus,
  RotateCcw,
  Bell,
  User,
  CheckCircle2,
  X,
  LogIn,
  LogOut,
} from 'lucide-react';
import { UserProfile } from '../types/subscription';
import { InAppNotification } from '../lib/notifications';

export type NavTab = 'dashboard' | 'subscriptions' | 'audit' | 'cancel_keep' | 'renewals';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onResetSeed: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  currentUser: UserProfile | null;
  notifications: InAppNotification[];
  flagCount: number;
  upcomingRenewalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenAddModal,
  onOpenImportModal,
  onResetSeed,
  onOpenAuth,
  onSignOut,
  currentUser,
  notifications,
  flagCount,
  upcomingRenewalsCount,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-foreground text-background flex items-center justify-center font-black tracking-tighter shrink-0 border border-foreground">
              <span className="font-mono text-xs font-bold">&#123; &#125;</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-lg sm:text-xl font-bold uppercase tracking-tight text-foreground">
                  SubAuditor
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  ( 2026 )
                </span>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest hidden sm:block">
                Vintage Look / Modern Build
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full border border-border bg-card/60">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'dashboard'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Overview</span>
            </button>

            <button
              onClick={() => onTabChange('subscriptions')}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'subscriptions'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Subscriptions</span>
            </button>

            <button
              onClick={() => onTabChange('audit')}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 relative ${
                currentTab === 'audit'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Audit</span>
              {flagCount > 0 && (
                <span className="font-mono px-1.5 py-0.2 rounded-full text-[10px] bg-foreground text-background">
                  {flagCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('cancel_keep')}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'cancel_keep'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Decisions</span>
            </button>

            <button
              onClick={() => onTabChange('renewals')}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'renewals'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Upcoming</span>
              {upcomingRenewalsCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
              )}
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Add Subscription */}
            <button
              onClick={onOpenAddModal}
              title="Add Subscription"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-foreground bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Plan</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-foreground hover:bg-card border border-border rounded-full transition-colors"
                title="Notifications & Reminders"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-foreground" />
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm rounded-2xl border border-foreground bg-card shadow-2xl p-5 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-foreground" />
                      <span className="font-editorial text-sm font-bold uppercase tracking-wide text-foreground">Reminders & Alerts</span>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="divide-y divide-border max-h-72 overflow-y-auto mt-2">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs font-mono text-muted-foreground">
                        No pending renewal alerts or audit notifications.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="py-3 text-xs">
                          <div className="font-semibold text-foreground flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {n.type}
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Account / Profile */}
            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-2 pl-2 border-l border-border">
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-full border border-border bg-card hover:border-foreground transition-all"
                  title="Switch Profile or Reset"
                >
                  <div className="w-6 h-6 rounded-full bg-foreground text-background font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground hidden lg:inline">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-2 border-l border-border">
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-border bg-card hover:bg-foreground hover:text-background text-foreground transition-colors shrink-0"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="grid grid-cols-5 md:hidden py-2 border-t border-border text-xs w-full">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`py-1.5 px-0.5 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors ${
              currentTab === 'dashboard' ? 'text-foreground font-bold' : 'text-muted-foreground'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-tight">Home</span>
          </button>
          <button
            onClick={() => onTabChange('subscriptions')}
            className={`py-1.5 px-0.5 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors ${
              currentTab === 'subscriptions' ? 'text-foreground font-bold' : 'text-muted-foreground'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-tight">Subs</span>
          </button>
          <button
            onClick={() => onTabChange('audit')}
            className={`py-1.5 px-0.5 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
              currentTab === 'audit' ? 'text-foreground font-bold' : 'text-muted-foreground'
            }`}
          >
            <div className="relative">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {flagCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1 rounded-full text-[9px] font-mono bg-foreground text-background">
                  {flagCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono uppercase tracking-tight">Audit</span>
          </button>
          <button
            onClick={() => onTabChange('cancel_keep')}
            className={`py-1.5 px-0.5 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors ${
              currentTab === 'cancel_keep' ? 'text-foreground font-bold' : 'text-muted-foreground'
            }`}
          >
            <Scissors className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-tight">Decisions</span>
          </button>
          <button
            onClick={() => onTabChange('renewals')}
            className={`py-1.5 px-0.5 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
              currentTab === 'renewals' ? 'text-foreground font-bold' : 'text-muted-foreground'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-tight">Upcoming</span>
          </button>
        </div>
      </div>
    </header>
  );
};
