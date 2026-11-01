/**
 * Sticky Countdown Hold Timer Banner
 * Implements Page 4 Timer Header with 5-minute Redis hold countdown,
 * Safe Area Insets compliance (Micro-UX #11), and urgency animations.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TimerBannerProps {
  expiresAt: number | null;
  onExpire: () => void;
  selectedCount: number;
}

export function TimerBanner({ expiresAt, onExpire, selectedCount }: TimerBannerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(300);

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft(300);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (!expiresAt || selectedCount === 0) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = timeLeft <= 60;
  const progressPercent = Math.min(100, Math.max(0, (timeLeft / 300) * 100));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'sticky top-0 z-40 w-full',
          'bg-gradient-to-r from-[#D62828] via-[#E63946] to-[#D62828] text-white shadow-2xl',
          'pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2 px-4',
          isUrgent && 'animate-pulse'
        )}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Label & Hold notice */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            {isUrgent ? (
              <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0 animate-bounce" />
            ) : (
              <Clock className="w-4 h-4 text-white shrink-0" />
            )}
            <span>
              {isUrgent ? 'Hurry! Seat hold expiring soon:' : `Holding ${selectedCount} seat${selectedCount > 1 ? 's' : ''} in Redis:`}
            </span>
          </div>

          {/* Countdown Clock Badge */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-base sm:text-lg font-black tracking-widest px-2.5 py-0.5 rounded-lg bg-black/40 border border-white/20 shadow-inner">
              {formattedTime}
            </span>
          </div>
        </div>

        {/* Remaining Time Progress Bar */}
        <div className="w-full max-w-4xl mx-auto h-1 bg-black/30 rounded-full overflow-hidden mt-1.5">
          <motion.div
            className={cn(
              'h-full rounded-full transition-all duration-1000',
              isUrgent ? 'bg-amber-300' : 'bg-white'
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
