/**
 * Movie Discovery Card Component
 * Implements Page 2 Catalog Matrix Card with Blurhash Placeholders (Micro-UX #6),
 * Query Prefetching (Micro-UX #5), Balanced Headlines (Micro-UX #12),
 * and View Transition layout morphing (Micro-UX #7).
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Blurhash } from 'react-blurhash';
import { Star, Clock, MapPin, Sparkles } from 'lucide-react';
import { Movie } from '../../services/api';
import { cn } from '../../utils/cn';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onHoverPrefetch?: (movieId: string) => void;
  nearbyTheatreName?: string;
  nearbyDistanceKm?: number;
}

export function MovieCard({
  movie,
  onSelect,
  onHoverPrefetch,
  nearbyTheatreName = 'Grand Rex IMAX',
  nearbyDistanceKm = 1.4,
}: MovieCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleMouseEnter = () => {
    if (onHoverPrefetch) {
      onHoverPrefetch(movie.id);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter}
      onClick={() => onSelect(movie)}
      className="group flex flex-col rounded-2xl bg-[#16191E] border border-white/10 hover:border-[#26523C] hover:shadow-[0_12px_32px_rgba(38,82,60,0.3)] transition-colors duration-200 cursor-pointer overflow-hidden relative"
    >
      {/* Poster Media Box with Blurhash Placeholder */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#0F1115]">
        {/* Blurhash Placeholder Canvas */}
        {!imageLoaded && movie.blurHash && (
          <div className="absolute inset-0 z-0">
            <Blurhash
              hash={movie.blurHash}
              width="100%"
              height="100%"
              resolutionX={32}
              resolutionY={32}
              punch={1}
            />
          </div>
        )}

        {/* High-Resolution Poster Image */}
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={cn(
            'w-full h-full object-cover transition-all duration-500 group-hover:scale-105',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-black/75 backdrop-blur-md text-white border border-white/15">
            {movie.rating}
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-500/90 text-black shadow-md">
            <Star className="w-3 h-3 fill-black text-black" />
            <span>{movie.imdbRating}</span>
          </div>
        </div>

        {/* Bottom Ambient Vignette Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#16191E] via-[#16191E]/70 to-transparent" />
      </div>

      {/* Card Content & Details */}
      <div className="flex flex-col flex-grow p-4 -mt-6 z-10 space-y-2.5">
        {/* Movie Title with Balanced Text */}
        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 balanced-text">
          {movie.title}
        </h3>

        {/* Metadata info row */}
        <div className="flex items-center text-xs text-gray-400 gap-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{movie.durationMinutes} mins</span>
          </div>
          <span>•</span>
          <span className="line-clamp-1">{movie.genre.slice(0, 2).join(', ')}</span>
        </div>

        {/* Format Tags (IMAX, 3D, Dolby Atmos) */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {movie.formats.map((fmt) => (
            <span
              key={fmt}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300"
            >
              {fmt}
            </span>
          ))}
        </div>

        {/* Theatre Proximity Badge */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-gray-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate max-w-[130px] font-medium">{nearbyTheatreName}</span>
          </div>
          <span className="text-[11px] font-mono text-gray-500">{nearbyDistanceKm} km</span>
        </div>
      </div>
    </motion.div>
  );
}
