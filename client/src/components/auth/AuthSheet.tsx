/**
 * Authentication Component (Modal & Drawer)
 * Implements Page 1 Authentication using Radix Tabs & Radix Dialog
 * Features Forest Green active tab indicators and Crimson Red Action CTA
 */

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { triggerSuccessToast } from '../shared/UndoToast';

interface AuthSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthenticated: (user: { name: string; email: string }) => void;
}

export function AuthSheet({ open, onOpenChange, onAuthenticated }: AuthSheetProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = {
      name: loginEmail.split('@')[0] || 'Cinephile Guest',
      email: loginEmail || 'guest@reelcinema.com',
    };
    onAuthenticated(user);
    triggerSuccessToast(`Welcome back, ${user.name}!`);
    onOpenChange(false);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = {
      name: registerName || 'New Member',
      email: registerEmail || 'member@reelcinema.com',
    };
    onAuthenticated(user);
    triggerSuccessToast(`Account created! Welcome, ${user.name}.`);
    onOpenChange(false);
  };

  const handleGuestContinue = () => {
    const guestUser = {
      name: 'Guest Cinephile',
      email: `guest_${Math.floor(Math.random() * 8999 + 1000)}@reelcinema.com`,
    };
    onAuthenticated(guestUser);
    triggerSuccessToast('Continuing as Guest Cinephile');
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" />

        {/* Centered Modal Surface */}
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-3xl bg-[#16191E] border border-white/10 p-6 sm:p-8 text-white shadow-2xl outline-none animate-in fade-in zoom-in-95 duration-200">
          {/* Header branding */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#E63946]">
                Reel Cinema Pass
              </span>
              <Dialog.Title className="text-2xl font-extrabold tracking-tight text-white balanced-text">
                Access Cinema Experience
              </Dialog.Title>
            </div>
            <Dialog.Close className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">
            Login or register to book your cinema tickets
          </Dialog.Description>

          {/* Radix Tabs for Login / Register */}
          <Tabs.Root
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'login' | 'register')}
            className="mt-6"
          >
            <Tabs.List className="grid grid-cols-2 p-1 rounded-xl bg-[#0F1115] border border-white/5 mb-6">
              <Tabs.Trigger
                value="login"
                className="py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150 data-[state='active']:bg-[#26523C] data-[state='active']:text-white text-gray-400 hover:text-white"
              >
                Sign In
              </Tabs.Trigger>
              <Tabs.Trigger
                value="register"
                className="py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150 data-[state='active']:bg-[#26523C] data-[state='active']:text-white text-gray-400 hover:text-white"
              >
                Create Account
              </Tabs.Trigger>
            </Tabs.List>

            {/* Login Tab Flow */}
            <Tabs.Content value="login" className="space-y-4 outline-none">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 focus-within:border-[#26523C] transition-colors">
                    <Mail className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                    <input
                      type="email"
                      required
                      placeholder="name@cinema.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Password
                  </label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 focus-within:border-[#26523C] transition-colors">
                    <Lock className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                {/* Primary Crimson Action CTA */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D62828] to-[#E63946] hover:from-[#E63946] hover:to-[#FF4D5E] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#E63946]/20 transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Sign In & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </Tabs.Content>

            {/* Register Tab Flow */}
            <Tabs.Content value="register" className="space-y-4 outline-none">
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 focus-within:border-[#26523C] transition-colors">
                    <User className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                    <input
                      type="text"
                      required
                      placeholder="Alex Mercer"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 focus-within:border-[#26523C] transition-colors">
                    <Mail className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                    <input
                      type="email"
                      required
                      placeholder="alex@cinema.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Password
                  </label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-[#0F1115] border border-white/10 focus-within:border-[#26523C] transition-colors">
                    <Lock className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>
                </div>

                {/* Primary Crimson Action CTA */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D62828] to-[#E63946] hover:from-[#E63946] hover:to-[#FF4D5E] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#E63946]/20 transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </form>
            </Tabs.Content>
          </Tabs.Root>

          {/* Quick Guest Pass Option */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <button
              type="button"
              onClick={handleGuestContinue}
              className="text-xs text-gray-400 hover:text-emerald-400 transition-colors font-medium underline underline-offset-4"
            >
              Skip and continue as Guest Cinephile →
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
