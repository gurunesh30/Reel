/**
 * Showtime Pill Component
 * Implements Page 3 Showtime selection with Crimson hover states,
 * Micro-UX #5 prefetching, and Framer Motion spring physics.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Show } from '../../services/api';
import { cn } from '../../utils/cn';

interface ShowtimePillProps {
  show: Show;
  isSelected?: boolean;
  onSelect: (show: Show) => void;
  onHoverPrefetch?: (showId: string) => void;
}

export function ShowtimePill({
  show,
  isSelected = false,
  onSelect,
  onHoverPrefetch,
}: ShowtimePillProps) {
  const handleMouseEnter = () => {
    if (onHoverPrefetch) {
      onHoverPrefetch(show.id);
    }
  };

  const getFormatBadgeStyle = (format: Show['format']) => {
    switch (format) {
      case 'IMAX':
        return 'bg-blue-950/80 text-blue-300 border-blue-500/30';
      case 'Dolby Atmos':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/30';
      case '3D':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/30';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-600/30';
    }
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter}
      onClick={() => onSelect(show)}
      className={cn(
        'group relative flex flex-col items-center justify-center',
        'px-4 py-2.5 rounded-xl border transition-all duration-150 outline-none',
        isSelected
          ? 'bg-[#26523C] border-emerald-400 text-white shadow-lg shadow-[#26523C]/40 ring-2 ring-emerald-500/50'
          : 'bg-[#1F232B] border-white/10 text-gray-200 hover:border-[#E63946] hover:bg-[#16191E] hover:shadow-[0_0_18px_rgba(230,57,70,0.35)]'
      )}
    >
      {/* Start Time */}
      <span className="text-base font-bold tracking-tight text-white group-hover:text-white">
        {show.startTime}
      </span>

      {/* Screen Format and Price Subtext */}
      <div className="flex items-center gap-1.5 mt-1">
        <span
          className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded border',
            getFormatBadgeStyle(show.format)
          )}
        >
          {show.format}
        </span>
        <span className="text-[11px] font-medium text-gray-400 group-hover:text-gray-300">
          ${show.basePrice}
        </span>
      </div>
    </motion.button>
  );
}
