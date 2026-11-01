/**
 * Interactive Seat Item Component
 * Implements Page 4 Seat Matrix with 4 distinct status states,
 * Micro-UX #10 (12px invisible touch hit-slop), and tactile micro-bounce animations.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Seat } from '../../services/api';
import { cn } from '../../utils/cn';

interface SeatItemProps {
  seat: Seat;
  onToggle: (seatId: string) => void;
}

export function SeatItem({ seat, onToggle }: SeatItemProps) {
  const isClickable = seat.status === 'available' || seat.status === 'held_by_you';

  // Specific state styling adhering to Section 1 & Section 4
  const getStatusStyles = () => {
    switch (seat.status) {
      case 'available':
        // Available: Forest Green border / Charcoal core
        return 'border border-[#26523C] bg-[#16191E] text-gray-400 hover:border-emerald-400 hover:bg-[#1B3B2B]/50 hover:text-white';

      case 'held_by_you':
        // Held by You: Solid Forest Green with glowing outline
        return 'bg-[#26523C] border-2 border-emerald-400 text-white shadow-[0_0_14px_#26523C] ring-2 ring-emerald-500/50';

      case 'held_by_others':
        // Held by Others (SSE Live Update): Crimson Red crosshatch / outline
        return 'seat-crosshatch-crimson';

      case 'booked':
        // Booked: Solid Charcoal Black (blends into grid backdrop)
        return 'bg-[#0F1115] border border-white/5 text-gray-700 cursor-not-allowed opacity-40';

      default:
        return 'border border-[#26523C] bg-[#16191E] text-gray-400';
    }
  };

  return (
    <div className="relative p-[6px] -m-[6px]">
      {/* 12px Invisible Touch Hit Slop Target for Mobile */}
      <motion.button
        type="button"
        disabled={!isClickable}
        onClick={() => onToggle(seat.id)}
        whileHover={isClickable ? { scale: 1.12, zIndex: 10 } : undefined}
        whileTap={isClickable ? { scale: 0.88 } : undefined}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        aria-label={`Seat ${seat.row}${seat.seatNumber}, ${seat.tier}, ${seat.status}, $${seat.price}`}
        className={cn(
          'hit-slop-12 relative flex items-center justify-center',
          'w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] sm:text-xs font-semibold select-none transition-colors duration-150',
          getStatusStyles(),
          seat.tier === 'VIP' ? 'font-bold' : 'font-medium'
        )}
      >
        {/* Seat Number */}
        <span className="leading-none pointer-events-none">
          {seat.seatNumber}
        </span>

        {/* VIP Small Diamond Dot */}
        {seat.tier === 'VIP' && seat.status === 'available' && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full" />
        )}
      </motion.button>
    </div>
  );
}
