/**
 * Cinematic Hero Carousel Component
 * Displays featured movies with backdrops, poster art, format tags,
 * synopsis, auto-rotation with hover pause, and Crimson Red CTAs.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Ticket,
  Star,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Movie } from '../../services/api';
import { cn } from '../../utils/cn';

interface HeroCarouselProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onExploreCatalog: () => void;
}

export function HeroCarousel({
  movies,
  onSelectMovie,
  onExploreCatalog,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const currentMovie = movies[currentIndex] || movies[0];

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  // Auto-play timer (advances every 6.5 seconds when not hovered)
  useEffect(() => {
    if (isPaused || movies.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 6500);

    return () => clearInterval(interval);
  }, [isPaused, handleNext, movies.length]);

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: 1.04,
      x: dir > 0 ? 40 : -40,
    }),
    center: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.65,
        ease: 'easeOut',
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      scale: 0.98,
      x: dir > 0 ? -40 : 40,
      transition: {
        duration: 0.45,
        ease: 'easeIn',
      },
    }),
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#0F1115] text-white select-none"
    >
      {/* 1. Backdrop Image with AnimatePresence */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={currentMovie.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <img
              src={currentMovie.backdropUrl}
              alt={currentMovie.title}
              className="w-full h-full object-cover opacity-35 filter brightness-75 contrast-125 scale-105"
            />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Crimson and Charcoal Lighting Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F1115] via-[#0F1115]/60 to-transparent" />
        <div className="absolute inset-0 ambient-glow-crimson pointer-events-none opacity-60" />
      </div>

      {/* 2. Main Hero Slide Content */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-16 sm:pt-24 pb-12 flex-grow flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Movie Information */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMovie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                {/* Format Badges & Tag */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#D62828]/90 to-[#E63946]/90 text-white text-xs font-extrabold tracking-wide shadow-lg shadow-[#E63946]/30 border border-[#FF4D5E]/40">
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>NOW SHOWING PREMIERE</span>
                  </div>

                  <span className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-xs font-bold border border-white/15">
                    {currentMovie.rating}
                  </span>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/90 text-black font-extrabold text-xs shadow-md">
                    <Star className="w-3.5 h-3.5 fill-black text-black" />
                    <span>{currentMovie.imdbRating}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-300 font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{currentMovie.durationMinutes} mins</span>
                  </div>
                </div>

                {/* Movie Title */}
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white balanced-text leading-tight drop-shadow-2xl">
                  {currentMovie.title}
                </h1>

                {/* Genre Tags */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-gray-300">
                  <span className="text-[#FF4D5E] font-bold">
                    {currentMovie.genre.join(' • ')}
                  </span>
                  <span>|</span>
                  <span className="text-gray-400">{currentMovie.language}</span>
                  <span>|</span>
                  <div className="flex items-center gap-1.5">
                    {currentMovie.formats.map((fmt) => (
                      <span
                        key={fmt}
                        className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-gray-200"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Synopsis */}
                <p className="max-w-2xl text-base sm:text-lg text-gray-300/95 leading-relaxed line-clamp-3 balanced-text font-normal">
                  {currentMovie.description}
                </p>

                {/* Primary Crimson Actions Row */}
                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onSelectMovie(currentMovie)}
                    className="btn-crimson px-8 py-4 rounded-2xl text-base font-extrabold tracking-wide flex items-center gap-3 cursor-pointer"
                  >
                    <Ticket className="w-5 h-5" />
                    <span>Book Tickets Now</span>
                    <ArrowRight className="w-5 h-5 text-white/90" />
                  </button>

                  <button
                    type="button"
                    onClick={onExploreCatalog}
                    className="px-6 py-4 rounded-2xl bg-[#16191E]/90 hover:bg-[#1F232B] border border-white/10 hover:border-[#E63946]/50 text-white font-bold text-base transition-all duration-200 shadow-lg"
                  >
                    Explore All Movies
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Floating Poster Showcase */}
          <div className="hidden lg:flex lg:col-span-4 justify-center items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMovie.id}
                initial={{ opacity: 0, scale: 0.9, rotateY: 12 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotateY: -12 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onSelectMovie(currentMovie)}
                className="group relative w-64 aspect-[2/3] rounded-3xl overflow-hidden cursor-pointer shadow-2xl border-2 border-white/10 hover:border-[#E63946] hover:shadow-[0_0_35px_rgba(230,57,70,0.5)] transition-all duration-300"
              >
                <img
                  src={currentMovie.posterUrl}
                  alt={currentMovie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-bold">
                  <span className="text-white drop-shadow">Click to Select</span>
                  <span className="text-[#FF4D5E] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Reserve →
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 3. Bottom Carousel Navigation Controls & Thumbnail Strip */}
      <div className="w-full border-t border-white/10 bg-[#0F1115]/90 backdrop-blur-xl px-4 sm:px-8 py-4 z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Arrow Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous movie"
              className="p-2.5 rounded-xl bg-[#16191E] border border-white/10 text-gray-300 hover:text-white hover:border-[#E63946] hover:shadow-[0_0_15px_rgba(230,57,70,0.4)] transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next movie"
              className="p-2.5 rounded-xl bg-[#16191E] border border-white/10 text-gray-300 hover:text-white hover:border-[#E63946] hover:shadow-[0_0_15px_rgba(230,57,70,0.4)] transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="text-xs text-gray-400 font-mono ml-2">
              <span className="text-white font-bold">{currentIndex + 1}</span> / {movies.length}
            </span>
          </div>

          {/* Interactive Thumbnails Selector Strip */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
            {movies.map((movie, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200 text-left shrink-0',
                    isActive
                      ? 'bg-[#16191E] border-2 border-[#E63946] shadow-[0_0_16px_rgba(230,57,70,0.4)] scale-105'
                      : 'bg-white/5 border border-white/5 opacity-60 hover:opacity-100 hover:bg-white/10'
                  )}
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-6 h-8 object-cover rounded-md"
                  />
                  <div className="hidden md:block">
                    <span className="text-xs font-bold text-white block line-clamp-1 max-w-[120px]">
                      {movie.title}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      ★ {movie.imdbRating}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
