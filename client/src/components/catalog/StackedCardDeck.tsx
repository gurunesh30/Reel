import React, { useState, useRef, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  PanInfo,
} from 'framer-motion';
import { Star, Film, Sparkles, Layers, MoveHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
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

interface TopInteractiveCardProps {
  movie: Movie;
  onSelectMovie: (movie: Movie) => void;
  onNext: () => void;
  onPrev: () => void;
}

function TopInteractiveCard({
  movie,
  onSelectMovie,
  onNext,
  onPrev,
}: TopInteractiveCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-18, 18]);
  const opacity = useTransform(x, [-280, -160, 0, 160, 280], [0.4, 0.95, 1, 0.95, 0.4]);
  const nextBadgeOpacity = useTransform(x, [-40, -100], [0, 1]);
  const prevBadgeOpacity = useTransform(x, [40, 100], [0, 1]);
  const [isDragging, setIsDragging] = useState(false);
  const [pinchScale, setPinchScale] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);

  // Dual-touch Pinch-to-zoom gesture listener
  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    let initialDistance = 0;
    let initialScale = 1;

    const getDistance = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches[0], e.touches[1]);
        initialScale = pinchScale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance > 0) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scaleFactor = currentDistance / initialDistance;
        const newScale = Math.min(Math.max(initialScale * scaleFactor, 0.8), 1.25);
        setPinchScale(newScale);
      }
    };

    const handleTouchEnd = () => {
      // Spring back from pinch on release
      setPinchScale(1);
      initialDistance = 0;
    };

    cardEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    cardEl.addEventListener('touchmove', handleTouchMove, { passive: true });
    cardEl.addEventListener('touchend', handleTouchEnd, { passive: true });
    cardEl.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      cardEl.removeEventListener('touchstart', handleTouchStart);
      cardEl.removeEventListener('touchmove', handleTouchMove);
      cardEl.removeEventListener('touchend', handleTouchEnd);
      cardEl.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [pinchScale]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const swipeThreshold = 65;
    const velocityThreshold = 250;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      onNext();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      onPrev();
    }
  };

  return (
    <motion.div
      ref={cardRef}
      style={{
        x,
        rotate,
        opacity,
        scale: pinchScale,
        zIndex: 40,
        transformOrigin: 'bottom center',
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.78}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97, cursor: 'grabbing' }}
      onClick={() => {
        if (!isDragging) {
          onSelectMovie(movie);
        }
      }}
      className={cn(
        'absolute inset-0 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none',
        'shadow-[0_25px_50px_rgba(0,0,0,0.88),0_0_40px_rgba(45,106,79,0.5)]',
        'border-2 border-emerald-400/80 ring-2 ring-emerald-500/20'
      )}
    >
      {/* Movie Poster Image */}
      <img
        src={movie.posterUrl}
        alt={movie.title}
        draggable={false}
        className="w-full h-full object-cover select-none pointer-events-none"
      />

      {/* Dark gradient scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

      {/* Dynamic Drag Direction Badges */}
      <motion.div
        style={{ opacity: nextBadgeOpacity }}
        className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2D6A4F] to-emerald-600 border border-emerald-300 text-white font-black text-xs shadow-xl flex items-center gap-1.5"
      >
        <span>NEXT</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </motion.div>

      <motion.div
        style={{ opacity: prevBadgeOpacity }}
        className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#2D6A4F] border border-emerald-300 text-white font-black text-xs shadow-xl flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>PREV</span>
      </motion.div>

      {/* Card Header Tag */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
        <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 border border-emerald-500/40">
          {movie.rating}
        </span>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-black font-extrabold text-[11px] shadow-md">
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
              className="px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-bold text-emerald-200"
            >
              {fmt}
            </span>
          ))}
          <span className="text-[11px] text-gray-300 font-medium">
            {movie.durationMinutes}m
          </span>
        </div>

        <h3 className="text-xl font-black text-white line-clamp-1 drop-shadow-md">
          {movie.title}
        </h3>

        <p className="text-[11px] text-gray-300 line-clamp-1">
          {movie.genre.join(', ')}
        </p>

        <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-emerald-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Click to Book
          </span>
          <span className="text-white/90">Details →</span>
        </div>
      </div>
    </motion.div>
  );
}

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
        'relative flex flex-col items-center justify-center w-full max-w-[340px] sm:max-w-[380px] h-[520px] select-none perspective-[1200px]',
        className
      )}
    >
      {/* Underlying Forest Green Ambient Glow Backdrop */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="w-[320px] h-[440px] rounded-full bg-gradient-to-tr from-[#1B3B2B]/70 via-[#2D6A4F]/50 to-emerald-500/30 blur-3xl opacity-80 animate-pulse" />
      </div>

      {/* Stack Deck Badge Indicator */}
      <div className="absolute top-0 z-30 flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#16191E]/95 border border-emerald-500/50 shadow-lg text-[11px] font-bold text-emerald-300">
        <Layers className="w-3.5 h-3.5 text-emerald-400" />
        <span>CARD DECK • {currentIndex + 1} OF {movies.length}</span>
      </div>

      {/* Layered Underlying Cards Stack Container */}
      <div className="relative w-[280px] sm:w-[320px] h-[430px] mt-6">
        {stackItems.map(({ movie, offset, index }) => {
          const isTop = offset === 0;

          if (isTop) {
            return (
              <TopInteractiveCard
                key={movie.id}
                movie={movie}
                onSelectMovie={onSelectMovie}
                onNext={onNext}
                onPrev={onPrev}
              />
            );
          }

          // Stacking geometry for underlying cards
          const translateY = offset * 18;
          const scale = 1 - offset * 0.055;
          const zIndex = 30 - offset * 5;
          const rotation = (offset % 2 === 1 ? -3 : 3) * offset;
          const opacity = Math.max(0.4, 1 - offset * 0.18);

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
              onClick={() => onNavigateToIndex(index)}
              className={cn(
                'absolute inset-0 rounded-3xl overflow-hidden cursor-pointer transition-shadow duration-300',
                'shadow-[0_15px_30px_rgba(0,0,0,0.6)] border border-white/10 hover:border-emerald-500/50 bg-[#16191E]'
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
              <div className="absolute bottom-4 left-4 right-4 pointer-events-none space-y-1">
                <h3 className="text-lg font-black text-white line-clamp-1 drop-shadow-md">
                  {movie.title}
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  Tap to bring to front
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Gesture Feedback Indicator */}
      <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-[#16191E]/80 border border-white/10 text-[11px] text-gray-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <MoveHorizontal className="w-3.5 h-3.5 text-emerald-400" />
        <span>Drag or swipe card • Pinch to zoom</span>
      </div>
    </div>
  );
}
