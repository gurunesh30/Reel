import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Film,
  MapPin,
  LogIn,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { useBooking, UserProfile } from '../context/BookingContext';
import { triggerSuccessToast } from '../components/shared/UndoToast';
import { cn } from '../utils/cn';

const MOCK_CREDENTIALS = [
  {
    role: 'VIP Cinephile Member',
    email: 'vip@reelcinema.com',
    password: 'reel2026',
    name: 'Alexander Cross',
    tier: 'VIP Premier Pass',
    badgeColor: 'from-amber-400 to-amber-600 text-black',
  },
  {
    role: 'Standard Cinephile',
    email: 'demo@reelcinema.com',
    password: 'cinema123',
    name: 'Sarah Connor',
    tier: 'Member Pass',
    badgeColor: 'from-emerald-400 to-teal-600 text-black',
  },
];

export function LoginPage() {
  const { currentUser, login, logout, activeCity, setActiveCity } = useBooking();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState(activeCity);
  const [isLoading, setIsLoading] = useState(false);

  // Quick fill handler
  const handleAutoFill = (cred: typeof MOCK_CREDENTIALS[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setName(cred.name);
    triggerSuccessToast(`Filled mock credentials for ${cred.name}`);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // Find matching mock user or construct user
      const matched = MOCK_CREDENTIALS.find((c) => c.email.toLowerCase() === email.toLowerCase());
      const user: UserProfile = {
        name: matched ? matched.name : (name || email.split('@')[0] || 'Cinephile User'),
        email: email || 'user@reelcinema.com',
        isGuest: false,
        tier: matched ? matched.tier : 'Member Pass',
      };

      login(user);
      setIsLoading(false);
      triggerSuccessToast(`Welcome back, ${user.name}!`);
      navigate('/home');
    }, 450);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const user: UserProfile = {
        name: name || 'New Cinephile',
        email: email || 'member@reelcinema.com',
        isGuest: false,
        tier: 'Standard Member',
      };

      setActiveCity(city);
      login(user);
      setIsLoading(false);
      triggerSuccessToast(`Account created successfully for ${user.name}!`);
      navigate('/home');
    }, 450);
  };

  const handleGuestContinue = () => {
    const guestUser: UserProfile = {
      name: 'Guest Cinephile',
      email: `guest_${Math.floor(Math.random() * 8999 + 1000)}@reelcinema.com`,
      isGuest: true,
      tier: 'Guest Access',
    };
    login(guestUser);
    triggerSuccessToast('Continuing as Guest Cinephile');
    navigate('/home');
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#9B111E] to-[#E63946] shadow-xl shadow-[#E63946]/40 border border-[#FF4D5E]/40 mb-2">
            <Film className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight balanced-text">
            Reel Cinema Pass
          </h1>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Sign in to access VIP seat reservations, real-time ticket holds, and digital passes.
          </p>
        </div>

        {/* If already signed in, show status card */}
        {!currentUser.isGuest && (
          <div className="card-crimson-glass p-6 rounded-3xl space-y-4 border border-[#E63946]/40">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 font-bold">
                  {currentUser.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{currentUser.name}</h3>
                  <p className="text-xs text-gray-400">{currentUser.email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
                {currentUser.tier || 'Active Member'}
              </span>
            </div>

            <p className="text-xs text-gray-300">
              You are currently authenticated and ready to book movie tickets across all screens.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/booking')}
                className="btn-crimson flex-grow py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Browse & Book Movies</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  triggerSuccessToast('Signed out of session');
                }}
                className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Mock Credentials Quick Selector Panel */}
        <div className="rounded-3xl bg-[#16191E]/90 border border-[#E63946]/30 p-5 space-y-3.5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#FF4D5E]">
              <KeyRound className="w-4 h-4" />
              <span>Mock Credentials (1-Click Fill)</span>
            </div>
            <span className="text-[10px] bg-red-950/80 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
              Demo Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MOCK_CREDENTIALS.map((cred) => (
              <button
                key={cred.email}
                type="button"
                onClick={() => handleAutoFill(cred)}
                className="group p-3 rounded-2xl bg-[#0F1115] hover:bg-[#1F1215] border border-white/10 hover:border-[#E63946]/60 text-left transition-all duration-200"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-[#FF4D5E]">
                  <span>{cred.name}</span>
                  <span className={cn('text-[9px] px-1.5 py-0.5 rounded font-black bg-gradient-to-r', cred.badgeColor)}>
                    {cred.tier.split(' ')[0]}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 font-mono mt-1">{cred.email}</div>
                <div className="text-[10px] text-gray-500 font-mono">pwd: {cred.password}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Auth Form Card */}
        <div className="rounded-3xl bg-[#16191E]/95 border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          {/* Tabs for Sign In vs Sign Up */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#0F1115] border border-white/5">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={cn(
                'py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all',
                activeTab === 'signin'
                  ? 'bg-gradient-to-r from-[#9B111E] to-[#E63946] text-white shadow-lg shadow-[#E63946]/30'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className={cn(
                'py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all',
                activeTab === 'signup'
                  ? 'bg-[#1B3B2B] text-emerald-300 border border-emerald-500/50 shadow-lg shadow-emerald-950/40'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Form Content */}
          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. vip@reelcinema.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 text-sm text-white placeholder-gray-500 focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946]/30 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 text-sm text-white placeholder-gray-500 focus:border-[#E63946] focus:ring-1 focus:ring-[#E63946]/30 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-crimson py-3.5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {isLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Sign In with Cinema Pass</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Miller"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="jordan@reelcinema.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                  Preferred Cinema City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="Metropolis">Metropolis</option>
                    <option value="Gotham">Gotham</option>
                    <option value="Neo Tokyo">Neo Tokyo</option>
                    <option value="Star City">Star City</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1B3B2B] to-[#2D6A4F] hover:from-[#26523C] hover:to-[#388E3C] text-white font-extrabold text-sm flex items-center justify-center gap-2 border border-emerald-400/40 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer mt-4"
              >
                {isLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Create Free Member Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Guest Bypass */}
          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <span>Want to test immediately?</span>
            <button
              type="button"
              onClick={handleGuestContinue}
              className="text-[#FF4D5E] hover:text-white font-bold flex items-center gap-1 transition-colors"
            >
              <span>Continue as Guest</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            to="/home"
            className="text-xs text-gray-400 hover:text-white transition-colors underline underline-offset-4"
          >
            ← Back to Home & Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
