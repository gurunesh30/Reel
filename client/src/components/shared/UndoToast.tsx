/**
 * Transient Undo Toast Notification System
 * Implements Micro-UX Pattern #4 (Sonner-based 4-second transient undo notifications)
 * Banned from backend-committed states (e.g. active payment or finalized bookings)
 */

import React from 'react';
import { toast, Toaster } from 'sonner';
import { RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Emits a 4-second auto-dismissing toast with an interactive Undo action
 */
export function triggerUndoToast(message: string, onUndo: () => void, duration = 4000) {
  return toast.custom(
    (id) => (
      <div className="flex items-center justify-between gap-4 w-full max-w-sm px-4 py-3 rounded-xl bg-[#16191E] border border-[#26523C]/60 text-white shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <RotateCcw className="w-4 h-4 text-[#346E52] animate-spin-reverse" />
          <span className="text-sm font-medium text-gray-200">{message}</span>
        </div>
        <button
          onClick={() => {
            onUndo();
            toast.dismiss(id);
          }}
          className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg bg-[#26523C] hover:bg-[#346E52] text-white transition-all duration-150 active:scale-95 shadow-md"
        >
          Undo
        </button>
      </div>
    ),
    {
      duration,
      id: `undo-${Date.now()}`,
    }
  );
}

/**
 * Emits a high-urgency Crimson alert toast (e.g., 409 Conflict)
 */
export function triggerConflictAlert(message: string) {
  return toast.custom(
    () => (
      <div className="flex items-center gap-3 w-full max-w-sm px-4 py-3 rounded-xl bg-[#16191E] border border-[#E63946] text-white shadow-2xl backdrop-blur-md">
        <AlertCircle className="w-5 h-5 text-[#E63946] shrink-0" />
        <span className="text-sm font-medium text-gray-100">{message}</span>
      </div>
    ),
    { duration: 4500 }
  );
}

/**
 * Emits a Forest Green success confirmation toast
 */
export function triggerSuccessToast(message: string) {
  return toast.custom(
    () => (
      <div className="flex items-center gap-3 w-full max-w-sm px-4 py-3 rounded-xl bg-[#16191E] border border-[#26523C] text-white shadow-2xl backdrop-blur-md">
        <CheckCircle className="w-5 h-5 text-[#346E52] shrink-0" />
        <span className="text-sm font-medium text-gray-100">{message}</span>
      </div>
    ),
    { duration: 3500 }
  );
}

/**
 * Global Cinematic Sonner Toaster Provider
 */
export function CinematicToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#16191E',
          color: '#F3F4F6',
          border: '1px solid #2A303C',
          borderRadius: '14px',
        },
      }}
    />
  );
}
