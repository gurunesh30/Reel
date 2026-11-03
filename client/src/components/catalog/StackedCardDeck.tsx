import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Film, Sparkles, Layers } from 'lucide-react';
import { Movie } from '../../services/api';
import { cn } from '../../utils/cn';

export interface StackedCardDeckProps {
  movies: Movie[];
  currentIndex: number;
  onSelectMovie: (movie: Movie) => void;
  onNavigateToIndex: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  className?: string;
}

const VISIBLE_CARDS = 4;

export function StackedCardDeck({
  movies,
  currentIndex,
  onSelectMovie,
  onNavigateToIndex,
  onNext,
  onPrev,
  className,
}: StackedCardDeckProps) {
  if (!movies || movies.length === 0) return null;

  // Build the slice of cards to display in the 3D stack
  const stackItems = Array.from({ length: Math.min(VISIBLE_CARDS, movies.length) }).map(
    (_, offset) => {
      const movieIndex = (currentIndex + offset) % movies.length;
      return {
        movie: movies[movieIndex],
        offset,
        index: movieIndex,
      };
    }
  );

  return (
    <div
      className={cn(
        'relative flex items-center justify-center w-full max-w-[340px] sm:max-w-[380px] h-[500px] select-none perspective-[1200px]',
        className
      )}
    >
      {/* Underlying Forest Green Ambient Glow Backdrop */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="w-[320px] h-[440px] rounded-full bg-gradient-to-tr from-[#1B3B2B]/60 via-[#2D6A4F]/40 to-emerald-500/20 blur-3xl opacity-75 animate-pulse" />
      </div>

      {/* Stack Deck Badge Indicator */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16191E]/90 border border-emerald-500/40 shadow-lg text-[11px] font-bold text-emerald-300">
        <Layers className="w-3.5 h-3.5 text-emerald-400" />
        <span>CARD DECK • {currentIndex + 1} OF {movies.length}</span>
      </div>

      {/* Layered Underlying Cards Stack */}
      <div className="relative w-[280px] sm:w-[320px] h-[430px]">
        {stackItems.map(({ movie, offset, index }) => {
          const isTop = offset === 0;

          // Stacking geometry
          const translateY = offset * 18;
          const scale = 1 - offset * 0.055;
          const zIndex = 30 - offset * 5;
          const rotation = offset === 0 ? 0 : (offset % 2 === 1 ? -3 : 3) * offset;
          const opacity = Math.max(0.45, 1 - offset * 0.18);

          return (
            <motion.div
              key={movie.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{
                opacity,
                scale,
                y: translateY,
                rotateZ: rotation,
                zIndex,
              }}
              exit={{ opacity: 0, scale: 0.85, y: -40 }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 26,
              }}
              style={{
                zIndex,
                transformOrigin: 'bottom center',
              }}
              onClick={() => {
                if (isTop) {
                  onSelectMovie(movie);
                } else {
                  onNavigateToIndex(index);
                }
              }}
              className={cn(
                'absolute inset-0 rounded-3xl overflow-hidden cursor-pointer transition-shadow duration-300',
                isTop
                  ? 'shadow-[0_25px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(45,106,79,0.45)] border-2 border-emerald-500/60 ring-1 ring-emerald-400/30'
                  : 'shadow-[0_15px_30px_rgba(0,0,0,0.6)] border border-white/10 hover:border-emerald-500/40 bg-[#16191E]'
              )}
            >
              {/* Movie Poster Image */}
              <img
                src={movie.posterUrl}
                alt={movie.title}
                draggable={false}
                className="w-full h-full object-cover select-none pointer-events-none"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

              {/* Card Header Tag */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                  {movie.rating}
                </span>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/90 text-black font-extrabold text-[11px] shadow">
                  <Star className="w-3 h-3 fill-black text-black" />
                  <span>{movie.imdbRating}</span>
                </div>
              </div>

              {/* Card Footer Content */}
              <div className="absolute bottom-4 left-4 right-4 pointer-events-none space-y-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {movie.formats.slice(0, 2).map((fmt) => (
                    <span
                      key={fmt}
                      className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-bold text-emerald-200"
                    >
                      {fmt}
                    </span>
                  ))}
                  <span className="text-[11px] text-gray-300 font-medium">
                    {movie.durationMinutes}m
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-white line-clamp-1 drop-shadow-md">
                  {movie.title}
                </h3>

                <p className="text-[11px] text-gray-300 line-clamp-1">
                  {movie.genre.join(', ')}
                </p>

                {isTop && (
                  <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Click to Book
                    </span>
                    <span className="text-white/80">Details →</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
