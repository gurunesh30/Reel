/**
 * Interactive Seat Grid Component
 * Implements Page 4 Seat Matrix with Curved SVG Screen Visualizer,
 * Real-Time SSE synchronization (useSSE), Optimistic seat locks (useOptimisticSeat),
 * and Safe-Area compliant floating checkout dock.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRight, ShieldCheck, Sparkles, Radio } from 'lucide-react';
import { Show, Movie, Seat, api } from '../../services/api';
import { useOptimisticSeat } from '../../hooks/useOptimisticSeat';
import { useSSE } from '../../hooks/useSSE';
import { SeatItem } from './SeatItem';
import { TimerBanner } from './TimerBanner';
import { SeatGridSkeleton } from '../shared/SkeletonLoader';
import { triggerConflictAlert, triggerUndoToast } from '../shared/UndoToast';
import { cn } from '../../utils/cn';

interface SeatGridProps {
  show: Show;
  movie: Movie;
  userId: string;
  onProceedToPayment: (selectedSeats: Seat[]) => void;
  onBack: () => void;
}

export function SeatGrid({
  show,
  movie,
  userId,
  onProceedToPayment,
  onBack,
}: SeatGridProps) {
  const [initialLoading, setInitialLoading] = useState(true);
  const [rawSeats, setRawSeats] = useState<Seat[]>([]);

  // Fetch initial seat map topology
  useEffect(() => {
    let isMounted = true;
    setInitialLoading(true);

    api.getSeatMap(show.id)
      .then((seats) => {
        if (isMounted) {
          setRawSeats(seats);
          setInitialLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching seat map:', err);
        if (isMounted) setInitialLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [show.id]);

  // Optimistic Seat Locking Hook (Micro-UX #2 & #4)
  const {
    seats,
    selectedSeats,
    totalPrice,
    holdExpiresAt,
    toggleSeat,
    updateSeatStatus,
    setAllSeats,
    clearAllHolds,
  } = useOptimisticSeat({
    showId: show.id,
    userId,
    initialSeats: rawSeats,
    onConflict: (_seatId, msg) => {
      triggerConflictAlert(msg);
    },
    onDeselectUndo: (seat, undoAction) => {
      triggerUndoToast(`Seat ${seat.row}${seat.seatNumber} deselected`, undoAction, 4000);
    },
  });

  // Sync initial loaded seats with optimistic store
  useEffect(() => {
    if (rawSeats.length > 0) {
      setAllSeats(rawSeats);
    }
  }, [rawSeats, setAllSeats]);

  // Real-Time SSE Subscription for concurrent remote user holds
  const { isConnected } = useSSE({
    showId: show.id,
    currentUserId: userId,
    onSeatUpdate: (seatId, newStatus) => {
      updateSeatStatus(seatId, newStatus);
    },
  });

  // Group seats by row identifier
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatsByRow = rows.map((row) => ({
    row,
    isVip: row === 'E' || row === 'F',
    seats: seats.filter((s) => s.row === row),
  }));

  return (
    <div className="relative min-h-screen bg-[#0F1115] text-white flex flex-col justify-between">
      {/* 1. Sticky Countdown Hold Timer Banner */}
      <TimerBanner
        expiresAt={holdExpiresAt}
        onExpire={() => {
          clearAllHolds();
          triggerConflictAlert('Seat hold expired after 5 minutes. Please re-select your seats.');
        }}
        selectedCount={selectedSeats.length}
      />

      {/* 2. Top Header Navigation Bar */}
      <header className="px-4 py-4 max-w-5xl mx-auto w-full flex items-center justify-between border-b border-white/5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-xs font-semibold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Change Showtime</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-bold text-white balanced-text">{movie.title}</h2>
          <p className="text-xs text-gray-400">
            {show.theatreName} • <span className="text-emerald-400 font-semibold">{show.startTime}</span> ({show.format})
          </p>
        </div>

        {/* Real-time SSE Live Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            )}
          />
          <span className="text-gray-300 hidden sm:inline">
            {isConnected ? 'Live Sync Active' : 'Connecting...'}
          </span>
        </div>
      </header>

      {/* 3. Main Interactive Seat Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-6 max-w-5xl mx-auto w-full">
        {initialLoading ? (
          <SeatGridSkeleton />
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Curved SVG Screen Visualizer */}
            <div className="w-full max-w-xl mx-auto flex flex-col items-center mb-8 relative">
              <svg className="w-full h-10 overflow-visible" viewBox="0 0 500 45">
                <defs>
                  <linearGradient id="screenCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1B3B2B" stopOpacity="0.2" />
                    <stop offset="30%" stopColor="#26523C" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#346E52" stopOpacity="1" />
                    <stop offset="70%" stopColor="#26523C" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#1B3B2B" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <path
                  d="M 25 38 Q 250 8 475 38"
                  fill="none"
                  stroke="url(#screenCurveGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
              {/* Soft ambient backlight */}
              <div className="absolute top-1 w-3/4 h-6 bg-[#26523C]/25 blur-xl -z-10 rounded-full" />
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gray-400 mt-1">
                Screen Curved Visualizer
              </span>
            </div>

            {/* Matrix of Seats */}
            <div className="w-full max-w-2xl flex flex-col items-center gap-3 sm:gap-3.5 my-2">
              {seatsByRow.map(({ row, isVip, seats: rowSeats }) => (
                <div key={row} className="flex items-center gap-2 sm:gap-3 w-full justify-center">
                  {/* Left Row Identifier */}
                  <span className="w-5 text-xs font-mono font-bold text-gray-500 text-right select-none">
                    {row}
                  </span>

                  {/* Seats in this row with aisle gaps */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {rowSeats.map((seat, seatIdx) => (
                      <React.Fragment key={seat.id}>
                        <SeatItem seat={seat} onToggle={toggleSeat} />
                        {/* Aisle walkaways after seat 2 and 8 */}
                        {(seatIdx === 1 || seatIdx === 7) && (
                          <div className="w-3 sm:w-5" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Right Row Identifier */}
                  <span className="w-5 text-xs font-mono font-bold text-gray-500 text-left select-none">
                    {row}
                  </span>
                </div>
              ))}
            </div>

            {/* VIP Label Tag */}
            <div className="mt-4 flex items-center gap-2 text-xs text-amber-400/90 font-medium bg-amber-950/20 px-3 py-1 rounded-full border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Rows E & F: VIP Premium Recliners (+ $6.00)</span>
            </div>

            {/* Status Legend Matrix */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-300 py-3 px-4 rounded-2xl bg-[#16191E] border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md border border-[#26523C] bg-[#16191E]" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-[#26523C] border border-emerald-400 shadow-[0_0_8px_#26523C]" />
                <span className="text-emerald-300 font-semibold">Held by You</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md seat-crosshatch-crimson" />
                <span className="text-[#E63946]">Held by Others (SSE)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-[#0F1115] border border-white/10 opacity-50" />
                <span className="text-gray-500">Booked</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Bottom Floating Dock for Checkout */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className={cn(
              'sticky bottom-0 z-40 w-full',
              'bg-[#16191E]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl',
              'px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]'
            )}
          >
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Selected Seats summary */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold block">
                    Seats Selected ({selectedSeats.length})
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {selectedSeats.map((s) => (
                      <span
                        key={s.id}
                        className="px-2 py-0.5 rounded-md bg-[#26523C] text-emerald-200 text-xs font-bold border border-emerald-500/30"
                      >
                        {s.row}{s.seatNumber}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="sm:border-l sm:border-white/10 sm:pl-4">
                  <span className="text-xs text-gray-400 block">Subtotal</span>
                  <span className="text-lg font-black text-white">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Primary Crimson Red Action CTA */}
              <button
                type="button"
                onClick={() => onProceedToPayment(selectedSeats)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#D62828] to-[#E63946] hover:from-[#E63946] hover:to-[#FF4D5E] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#E63946]/30 transition-all duration-150 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
