import React, { useState } from 'react';
import { UserProfile } from '../types/subscription';
import { X, Mail, Lock, User, LogIn, UserPlus, Sparkles, CheckCircle2, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
}

export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'usr_default_demo',
    name: 'Soumya Namboori',
    email: 'soumyanamboori@gmail.com',
    currency: 'INR',
    reminderDays: 3,
  },
  {
    id: 'usr_student',
    name: 'Aanya Patel',
    email: 'aanya.patel@university.edu',
    currency: 'INR',
    reminderDays: 2,
  },
  {
    id: 'usr_freelance',
    name: 'Rohan Mehta',
    email: 'rohan@creativestudio.in',
    currency: 'INR',
    reminderDays: 5,
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const user: UserProfile = {
      id: `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      name: name.trim() || email.split('@')[0],
      currency: 'INR',
      reminderDays: 3,
    };

    onLogin(user);
    onClose();
  };

  const handleSelectDemo = (profile: UserProfile) => {
    onLogin(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 sm:p-8 overflow-hidden my-8 z-10 text-foreground">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              // OPERATOR PROFILE
            </div>
            <h3 className="font-editorial text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
              {currentUser ? 'User Account & Profiles' : mode === 'LOGIN' ? 'Sign In to Account' : 'Create New Account'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono uppercase tracking-wider">
              {currentUser
                ? 'Switch between accounts or sign out of session'
                : 'Select an account profile below or sign in'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentUser ? (
          <div className="mt-5 space-y-5">
            {/* Active User Status Card */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/90 flex items-center gap-3.5 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-lg shadow-sm">
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-zinc-900 dark:text-white text-base truncate">
                  {currentUser.name || 'Auditor User'}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-300 font-medium truncate mt-0.5">
                  {currentUser.email}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Currently Logged In
                </div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors shrink-0 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Switch Persona Section */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Available Account Profiles:
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Click to switch instantly
                </span>
              </div>

              <div className="space-y-2.5">
                {DEMO_PROFILES.map(profile => {
                  const isCurrent = currentUser.id === profile.id;
                  return (
                    <button
                      key={profile.id}
                      onClick={() => handleSelectDemo(profile)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/40'
                          : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/90 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-500'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                          }`}
                        >
                          {profile.name[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                            {profile.name}
                          </div>
                          <div className="text-xs text-zinc-600 dark:text-zinc-300 font-medium truncate">
                            {profile.email}
                          </div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                          <span>Switch</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Website</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {/* Quick 1-Click Persona Login Cards */}
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Quick 1-Click Account Sign In:
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">No password required</span>
              </div>

              <div className="space-y-2 mt-2">
                {DEMO_PROFILES.map(demo => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className="w-full p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-left hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-zinc-700 transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-zinc-700 text-blue-700 dark:text-blue-300 font-black flex items-center justify-center text-xs shrink-0">
                        {demo.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                          {demo.name}
                        </div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-300 font-medium truncate">
                          {demo.email}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white group-hover:bg-blue-700 transition-colors shrink-0">
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Traditional Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Or Sign In with Custom Email:
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {error}
                </div>
              )}

              {mode === 'SIGNUP' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="e.g. Soumya Namboori"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                {mode === 'LOGIN' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{mode === 'LOGIN' ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
              </button>
            </form>

            <div className="text-center pt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {mode === 'LOGIN' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('SIGNUP');
                      setError('');
                    }}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    Sign up
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('LOGIN');
                      setError('');
                    }}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
