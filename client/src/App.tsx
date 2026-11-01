/**
 * Cinema Theatre Booking System - Unified Application Flow
 * Orchestrates Page 1 through Page 5 with Cinematic Theme,
 * Interruptible Animations (framer-motion), and Advanced Micro-UX Patterns.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film,
  MapPin,
  Calendar,
  Clock,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  Printer,
  Compass,
  ArrowRight,
  CheckCircle2,
  Ticket,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Movie,
  Theatre,
  Show,
  Seat,
  BookingReceipt,
  MOCK_MOVIES,
  MOCK_THEATRES,
  api,
} from './services/api';
import { usePrefetch } from './hooks/usePrefetch';
import { MovieCard } from './components/catalog/MovieCard';
import { ShowtimePill } from './components/catalog/ShowtimePill';
import { SeatGrid } from './components/booking/SeatGrid';
import { CommandMenu } from './components/shared/CommandMenu';
import { AuthSheet } from './components/auth/AuthSheet';
import { MovieCardSkeleton } from './components/shared/SkeletonLoader';
import { triggerSuccessToast, triggerConflictAlert } from './components/shared/UndoToast';
import { cn } from './utils/cn';

type PageView = 'landing' | 'discovery' | 'shows' | 'seats' | 'payment' | 'confirmation';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('landing');
  const [activeCity, setActiveCity] = useState<string>('Metropolis');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  // Navigation Selection States
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(MOCK_MOVIES[0]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-01');
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string }>({
    name: 'Cinephile Member',
    email: 'member@reelcinema.com',
  });
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState<boolean>(false);

  // Payment Processing State
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay'>('card');
  const [idempotencyKey, setIdempotencyKey] = useState<string>(
    () => `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  );

  // Prefetching Hook (Micro-UX #5)
  const { prefetchShows, prefetchSeats } = usePrefetch();

  // Filtered Movie Catalog
  const filteredMovies = useMemo(() => {
    return MOCK_MOVIES.filter((movie) => {
      const matchQuery =
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGenre = selectedGenre === 'All' || movie.genre.includes(selectedGenre);
      return matchQuery && matchGenre;
    });
  }, [searchQuery, selectedGenre]);

  // Shows for Selected Movie and Date
  const [showsList, setShowsList] = useState<Show[]>([]);
  const [loadingShows, setLoadingShows] = useState<boolean>(false);

  useEffect(() => {
    if (selectedMovie && currentPage === 'shows') {
      setLoadingShows(true);
      api.getShows(selectedMovie.id, selectedDate, activeCity).then((data) => {
        setShowsList(data);
        setLoadingShows(false);
      });
    }
  }, [selectedMovie, selectedDate, activeCity, currentPage]);

  // 7-Day Date Array
  const dateStrip = useMemo(() => {
    const dates = [];
    const base = new Date('2026-11-01');
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      dates.push({
        iso,
        dayName: dayNames[d.getDay()],
        dayNumber: d.getDate(),
        month: monthNames[d.getMonth()],
      });
    }
    return dates;
  }, []);

  // Handlers
  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setCurrentPage('shows');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectShow = (show: Show) => {
    setSelectedShow(show);
    setCurrentPage('seats');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToPayment = (seats: Seat[]) => {
    setSelectedSeats(seats);
    // Regenerate unique idempotency key for this payment session
    setIdempotencyKey(`idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    setCurrentPage('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExecutePayment = async () => {
    if (!selectedShow || !selectedMovie || selectedSeats.length === 0) return;

    setIsProcessingPayment(true);
    const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);

    try {
      const confirmedReceipt = await api.processPayment({
        bookingId: `BK-${Math.floor(Math.random() * 899999 + 100000)}`,
        showId: selectedShow.id,
        movieTitle: selectedMovie.title,
        theatreName: selectedShow.theatreName,
        screenName: selectedShow.screenName,
        format: selectedShow.format,
        showTime: selectedShow.startTime,
        showDate: selectedShow.date,
        seats: selectedSeats.map((s) => `${s.row}${s.seatNumber}`),
        totalAmount: subtotal,
        userName: currentUser.name,
        userEmail: currentUser.email,
        idempotencyKey,
      });

      setReceipt(confirmedReceipt);
      setIsProcessingPayment(false);
      setCurrentPage('confirmation');
      triggerSuccessToast('Payment authorized successfully! Digital pass issued.');
    } catch (err) {
      setIsProcessingPayment(false);
      triggerConflictAlert('Transaction failed or lock expired. Please retry.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F3F4F6] font-sans selection:bg-[#26523C] selection:text-white flex flex-col">
      {/* Global Command Menu (Cmd+K) */}
      <CommandMenu
        open={isCommandMenuOpen}
        onOpenChange={setIsCommandMenuOpen}
        movies={MOCK_MOVIES}
        theatres={MOCK_THEATRES}
        activeCity={activeCity}
        onSelectMovie={handleSelectMovie}
        onSelectTheatre={(th) => {
          setActiveCity(th.city);
          setCurrentPage('discovery');
        }}
        onSelectCity={(city) => setActiveCity(city)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onNavigateHome={() => setCurrentPage('landing')}
      />

      {/* Authentication Modal */}
      <AuthSheet
        open={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        onAuthenticated={(user) => setCurrentUser(user)}
      />

      {/* Global Sticky Navigation Bar (Pages 1-3 & 5) */}
      {currentPage !== 'seats' && (
        <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Branding Logo */}
            <div
              onClick={() => setCurrentPage('landing')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D62828] to-[#E63946] flex items-center justify-center shadow-lg shadow-[#E63946]/30 group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-wider text-white uppercase group-hover:text-red-400 transition-colors">
                  REEL<span className="text-[#E63946]">.</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-gray-400 -mt-1 font-semibold">
                  Cinema Experience
                </span>
              </div>
            </div>

            {/* Middle Nav Items */}
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-300">
              <button
                onClick={() => setCurrentPage('landing')}
                className={cn(
                  'transition-colors hover:text-white',
                  currentPage === 'landing' ? 'text-white border-b-2 border-[#26523C] pb-0.5' : ''
                )}
              >
                Featured
              </button>
              <button
                onClick={() => setCurrentPage('discovery')}
                className={cn(
                  'transition-colors hover:text-white',
                  currentPage === 'discovery' ? 'text-white border-b-2 border-[#26523C] pb-0.5' : ''
                )}
              >
                Now Showing
              </button>
            </div>

            {/* Right Controls: City Pill + Cmd+K + Auth */}
            <div className="flex items-center gap-2.5">
              {/* City Pill */}
              <button
                onClick={() => setIsCommandMenuOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16191E] border border-white/10 hover:border-[#26523C] text-xs font-semibold text-gray-200 transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeCity}</span>
              </button>

              {/* Command Menu Shortcut Trigger (Cmd+K) */}
              <button
                onClick={() => setIsCommandMenuOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
                  Cmd+K
                </span>
              </button>

              {/* User Account / Sign In */}
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#26523C]/50 hover:bg-[#26523C] text-white border border-emerald-500/30 text-xs font-bold transition-all duration-150 active:scale-95"
              >
                <User className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Router */}
      <div className="flex-grow">
        {/* ========================================================================= */}
        {/* PAGE 1: LANDING & AUTHENTICATION (Hero Trailer Marquee)                  */}
        {/* ========================================================================= */}
        {currentPage === 'landing' && (
          <section className="relative min-h-[90vh] flex flex-col justify-center px-4 sm:px-8 overflow-hidden ambient-glow-forest">
            {/* Ambient Background Visual */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <img
                src={MOCK_MOVIES[0].backdropUrl}
                alt="Cinema backdrop"
                className="w-full h-full object-cover opacity-25 filter blur-sm scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/85 to-transparent" />
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0F1115]/60 to-[#0F1115]" />
            </div>

            <div className="max-w-5xl mx-auto w-full py-16 space-y-6">
              {/* High Urgency Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1B3B2B]/90 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>IMAX LASER & DOLBY ATMOS PREMIERE</span>
              </div>

              {/* Hero Movie Title with Balanced Text */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white balanced-text leading-tight">
                {MOCK_MOVIES[0].title}
              </h1>

              {/* Meta tags */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 font-bold text-xs">
                  {MOCK_MOVIES[0].rating}
                </span>
                <span>•</span>
                <span>{MOCK_MOVIES[0].durationMinutes} Mins</span>
                <span>•</span>
                <span>{MOCK_MOVIES[0].genre.join(', ')}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">★ {MOCK_MOVIES[0].imdbRating} IMDb</span>
              </div>

              {/* Description */}
              <p className="max-w-2xl text-base sm:text-lg text-gray-300 leading-relaxed balanced-text">
                {MOCK_MOVIES[0].description}
              </p>

              {/* CTA Action Row */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => handleSelectMovie(MOCK_MOVIES[0])}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D62828] to-[#E63946] hover:from-[#E63946] hover:to-[#FF4D5E] text-white font-extrabold text-base tracking-wide shadow-xl shadow-[#E63946]/30 transition-all duration-200 active:scale-95 flex items-center gap-3"
                >
                  <Ticket className="w-5 h-5" />
                  <span>Book Tickets Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setCurrentPage('discovery')}
                  className="px-6 py-4 rounded-2xl bg-[#16191E] hover:bg-[#1F232B] border border-white/10 text-white font-bold text-base transition-colors"
                >
                  Explore All Movies
                </button>
              </div>

              {/* Feature Matrix Badges */}
              <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10">
                <div className="p-3 rounded-xl bg-[#16191E]/60 border border-white/5">
                  <span className="text-xs text-gray-400 block">Screen Format</span>
                  <span className="text-sm font-bold text-white">IMAX with Laser</span>
                </div>
                <div className="p-3 rounded-xl bg-[#16191E]/60 border border-white/5">
                  <span className="text-xs text-gray-400 block">Spatial Sound</span>
                  <span className="text-sm font-bold text-emerald-400">Dolby Atmos 128Ch</span>
                </div>
                <div className="p-3 rounded-xl bg-[#16191E]/60 border border-white/5">
                  <span className="text-xs text-gray-400 block">Seat Reservation</span>
                  <span className="text-sm font-bold text-white">Live Redis Hold</span>
                </div>
                <div className="p-3 rounded-xl bg-[#16191E]/60 border border-white/5">
                  <span className="text-xs text-gray-400 block">Payment Security</span>
                  <span className="text-sm font-bold text-white">Idempotent Commit</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* PAGE 2: MOVIE DISCOVERY & NEARBY THEATRES                                */}
        {/* ========================================================================= */}
        {currentPage === 'discovery' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            {/* Header Title + City Selector */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#E63946]">
                  Catalog Matrix
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white balanced-text">
                  Now Showing in {activeCity}
                </h2>
              </div>

              {/* Search input bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter movies by title or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#16191E] border border-white/10 text-sm text-white placeholder-gray-500 focus:border-[#26523C] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Genre Filter Strip with Forest Green Active States */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {['All', 'Sci-Fi', 'Action', 'Cyberpunk', 'Mystery', 'Drama', 'Adventure'].map(
                (genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 shrink-0',
                      selectedGenre === genre
                        ? 'bg-[#26523C] text-white shadow-md shadow-[#26523C]/40 border border-emerald-500/40'
                        : 'bg-[#16191E] text-gray-400 hover:text-white hover:bg-[#1F232B] border border-white/5'
                    )}
                  >
                    {genre}
                  </button>
                )
              )}
            </div>

            {/* Movies Matrix Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onSelect={handleSelectMovie}
                  onHoverPrefetch={(id) => prefetchShows(id, selectedDate, activeCity)}
                />
              ))}
            </div>

            {filteredMovies.length === 0 && (
              <div className="py-20 text-center space-y-3">
                <Film className="w-10 h-10 text-gray-600 mx-auto" />
                <p className="text-gray-400 font-medium">No movies found matching "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGenre('All');
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white hover:bg-white/20"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* PAGE 3: SHOW SELECTION MATRIX                                            */}
        {/* ========================================================================= */}
        {currentPage === 'shows' && selectedMovie && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Top Back Nav Button */}
            <button
              onClick={() => setCurrentPage('discovery')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Movies</span>
            </button>

            {/* 1. Compact Movie Summary Banner (View Transition Layout) */}
            <div className="relative rounded-3xl overflow-hidden bg-[#16191E] border border-white/10 p-6 flex flex-col sm:flex-row gap-6 items-center shadow-2xl">
              {/* Ambient backdrop */}
              <div className="absolute inset-0 -z-10 opacity-20">
                <img
                  src={selectedMovie.backdropUrl}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover filter blur-md"
                />
              </div>

              {/* Poster Thumbnail */}
              <img
                src={selectedMovie.posterUrl}
                alt={selectedMovie.title}
                className="w-24 sm:w-32 aspect-[2/3] object-cover rounded-xl shadow-lg border border-white/10 shrink-0"
              />

              <div className="space-y-2 flex-grow text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-[11px] font-bold text-white">
                    {selectedMovie.rating}
                  </span>
                  <span className="text-xs text-amber-400 font-bold">★ {selectedMovie.imdbRating}</span>
                  <span className="text-xs text-gray-400">• {selectedMovie.durationMinutes} mins</span>
                  <span className="text-xs text-gray-400">• {selectedMovie.language}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white balanced-text">
                  {selectedMovie.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 max-w-2xl leading-relaxed">
                  {selectedMovie.description}
                </p>
              </div>
            </div>

            {/* 2. Horizontal 7-Day Date Selector Strip */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Select Date
              </span>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {dateStrip.map((item) => {
                  const isActive = selectedDate === item.iso;
                  return (
                    <button
                      key={item.iso}
                      onClick={() => setSelectedDate(item.iso)}
                      className={cn(
                        'flex flex-col items-center justify-center px-4 py-3 rounded-2xl min-w-[76px] transition-all duration-150',
                        isActive
                          ? 'bg-[#26523C] text-white shadow-lg shadow-[#26523C]/40 border border-emerald-500/50 scale-105'
                          : 'bg-[#16191E] border border-white/5 text-gray-400 hover:text-white hover:bg-[#1F232B]'
                      )}
                    >
                      <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">
                        {item.dayName}
                      </span>
                      <span className="text-lg font-black">{item.dayNumber}</span>
                      <span className="text-[9px] font-semibold">{item.month}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Showtime Matrix Accordion by Theatre */}
            <div className="space-y-4 pt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                Theatres & Showtimes
              </span>

              {loadingShows ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-[#16191E] border border-white/5 animate-pulse h-32" />
                  <div className="p-6 rounded-2xl bg-[#16191E] border border-white/5 animate-pulse h-32" />
                </div>
              ) : (
                MOCK_THEATRES.filter((t) => t.city === activeCity).map((theatre) => {
                  const theatreShows = showsList.filter((s) => s.theatreId === theatre.id);
                  if (theatreShows.length === 0) return null;

                  return (
                    <div
                      key={theatre.id}
                      className="rounded-2xl bg-[#16191E] border border-white/10 p-5 sm:p-6 space-y-4 shadow-lg"
                    >
                      {/* Theatre Info Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#E63946] shrink-0" />
                          <h4 className="text-base font-bold text-white">{theatre.name}</h4>
                        </div>
                        <span className="text-xs text-gray-400 sm:text-right">
                          {theatre.location} • <span className="text-emerald-400">{theatre.distanceKm} km away</span>
                        </span>
                      </div>

                      {/* Showtime Pills Row with Hover Prefetching */}
                      <div className="flex flex-wrap gap-3">
                        {theatreShows.map((show) => (
                          <ShowtimePill
                            key={show.id}
                            show={show}
                            onSelect={handleSelectShow}
                            onHoverPrefetch={(id) => prefetchSeats(id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* PAGE 4: INTERACTIVE SEAT SELECTION (Real-Time Grid)                       */}
        {/* ========================================================================= */}
        {currentPage === 'seats' && selectedShow && selectedMovie && (
          <SeatGrid
            show={selectedShow}
            movie={selectedMovie}
            userId={currentUser.email}
            onProceedToPayment={handleProceedToPayment}
            onBack={() => setCurrentPage('shows')}
          />
        )}

        {/* ========================================================================= */}
        {/* PAGE 5: PAYMENT & TICKET CONFIRMATION                                    */}
        {/* ========================================================================= */}
        {currentPage === 'payment' && selectedShow && selectedMovie && (
          <section className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <button
              onClick={() => setCurrentPage('seats')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Seat Map</span>
            </button>

            <div className="rounded-3xl bg-[#16191E] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-[#E63946]">
                  Page 5: Checkout & Final Authorization
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 balanced-text">
                  Order Summary & Payment
                </h2>
              </div>

              {/* Movie & Show Recap */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0F1115] border border-white/5">
                <img
                  src={selectedMovie.posterUrl}
                  alt={selectedMovie.title}
                  className="w-16 aspect-[2/3] object-cover rounded-lg shadow"
                />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-base">{selectedMovie.title}</h4>
                  <p className="text-xs text-gray-400">
                    {selectedShow.theatreName} • {selectedShow.screenName}
                  </p>
                  <p className="text-xs text-emerald-400 font-medium">
                    {selectedShow.date} at {selectedShow.startTime}
                  </p>
                </div>
              </div>

              {/* Itemized Fee Breakdown */}
              <div className="space-y-3 pt-2 text-sm text-gray-300 border-t border-white/5">
                <div className="flex justify-between">
                  <span>Seats: {selectedSeats.map((s) => `${s.row}${s.seatNumber}`).join(', ')}</span>
                  <span className="font-semibold text-white">
                    ${selectedSeats.reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Integrated Cinema Tax (8%)</span>
                  <span>${(selectedSeats.reduce((sum, s) => sum + s.price, 0) * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Convenience & Real-time Hold Fee</span>
                  <span>$2.50</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between items-center text-lg font-black text-white">
                  <span>Total Amount Due</span>
                  <span className="text-xl text-emerald-400">
                    $
                    {(
                      selectedSeats.reduce((sum, s) => sum + s.price, 0) * 1.08 +
                      2.5
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Idempotency Token Info Box */}
              <div className="p-3 rounded-xl bg-[#1B3B2B]/40 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between font-mono">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Idempotency Key: {idempotencyKey.substring(0, 18)}...</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-400">Unique Lock</span>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      'p-3 rounded-xl border text-center transition-all',
                      paymentMethod === 'card'
                        ? 'border-emerald-400 bg-[#26523C]/50 text-white font-bold'
                        : 'border-white/5 bg-[#0F1115] text-gray-400 hover:text-white'
                    )}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-gray-300" />
                    <span className="text-xs">Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={cn(
                      'p-3 rounded-xl border text-center transition-all',
                      paymentMethod === 'apple_pay'
                        ? 'border-emerald-400 bg-[#26523C]/50 text-white font-bold'
                        : 'border-white/5 bg-[#0F1115] text-gray-400 hover:text-white'
                    )}
                  >
                    <span className="text-sm font-bold block mb-1"> Pay</span>
                    <span className="text-xs">Apple Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('google_pay')}
                    className={cn(
                      'p-3 rounded-xl border text-center transition-all',
                      paymentMethod === 'google_pay'
                        ? 'border-emerald-400 bg-[#26523C]/50 text-white font-bold'
                        : 'border-white/5 bg-[#0F1115] text-gray-400 hover:text-white'
                    )}
                  >
                    <span className="text-sm font-bold block mb-1 text-emerald-300">G Pay</span>
                    <span className="text-xs">Google Pay</span>
                  </button>
                </div>
              </div>

              {/* Submit Payment CTA */}
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleExecutePayment}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D62828] to-[#E63946] hover:from-[#E63946] hover:to-[#FF4D5E] disabled:opacity-50 text-white font-extrabold text-base tracking-wide shadow-xl shadow-[#E63946]/30 transition-all duration-150 active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing ACID Transaction...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>
                      Pay $
                      {(
                        selectedSeats.reduce((sum, s) => sum + s.price, 0) * 1.08 +
                        2.5
                      ).toFixed(2)}{' '}
                      & Generate Pass
                    </span>
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* POST-SUCCESS VIEW: DIGITAL PASS WITH ENTRY QR CODE                        */}
        {/* ========================================================================= */}
        {currentPage === 'confirmation' && receipt && (
          <section className="max-w-xl mx-auto px-4 py-10 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-[#26523C] text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-[#26523C]/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-white balanced-text">Booking Confirmed!</h2>
              <p className="text-sm text-gray-400">
                Your seats are permanently booked in PostgreSQL. Entry pass is ready.
              </p>
            </div>

            {/* Digital Pass Card */}
            <div className="rounded-3xl bg-[#16191E] border border-white/10 overflow-hidden shadow-2xl relative">
              {/* Header Ribbon */}
              <div className="bg-gradient-to-r from-[#1B3B2B] to-[#26523C] px-6 py-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-emerald-300" />
                  <span className="font-extrabold tracking-wider uppercase text-sm">
                    Reel Cinema Pass
                  </span>
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-black/30 border border-white/10">
                  {receipt.bookingId}
                </span>
              </div>

              {/* Pass Body Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-white">{receipt.movieTitle}</h3>
                  <p className="text-sm text-emerald-400 font-semibold">
                    {receipt.theatreName} • {receipt.screenName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5 text-xs">
                  <div>
                    <span className="text-gray-400 block">Date & Time</span>
                    <span className="font-bold text-white text-sm">
                      {receipt.showDate} at {receipt.showTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Confirmed Seats</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {receipt.seats.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Guest Cinephile</span>
                    <span className="font-bold text-white">{receipt.userName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Total Charged</span>
                    <span className="font-bold text-white">${receipt.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Entry QR Code Container */}
                <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl text-black space-y-2 shadow-inner">
                  <QrCode className="w-36 h-36 text-black" />
                  <span className="font-mono text-[11px] font-bold tracking-widest text-gray-700">
                    {receipt.qrCodeData}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    Scan at Cinema Turnstile for Entry
                  </span>
                </div>
              </div>

              {/* Pass Footer Actions */}
              <div className="p-4 bg-[#0F1115] border-t border-white/5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 hover:text-white transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage('discovery')}
                  className="px-5 py-2.5 rounded-xl bg-[#26523C] hover:bg-[#346E52] text-xs font-bold text-white transition-colors shadow-md"
                >
                  Book Another Show →
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Global Footer */}
      {currentPage !== 'seats' && (
        <footer className="w-full border-t border-white/5 py-6 px-4 text-center text-xs text-gray-500 mt-auto safe-pad-bottom">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>© 2026 Reel Cinema Systems. Unified Cinematic UI Architecture.</span>
            <div className="flex items-center gap-4 text-gray-400">
              <span>Charcoal Black • Forest Green • Crimson Red</span>
              <button
                onClick={() => setIsCommandMenuOpen(true)}
                className="hover:text-white underline underline-offset-2"
              >
                Cmd+K Palette
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
