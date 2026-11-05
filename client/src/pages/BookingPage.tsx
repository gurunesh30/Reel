import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Film, Star, Clock, Calendar, Ticket } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { SeatGrid } from '../components/booking/SeatGrid';
import { ShowtimePill } from '../components/catalog/ShowtimePill';
import { api, Show, Seat, MOCK_THEATRES, MOCK_MOVIES } from '../services/api';
import { usePrefetch } from '../hooks/usePrefetch';
import { cn } from '../utils/cn';

export function BookingPage() {
  const {
    selectedMovie,
    setSelectedMovie,
    selectedDate,
    setSelectedDate,
    selectedShow,
    setSelectedShow,
    selectedSeats,
    setSelectedSeats,
    activeCity,
    currentUser,
  } = useBooking();

  const navigate = useNavigate();
  const { prefetchSeats } = usePrefetch();

  const [showsList, setShowsList] = useState<Show[]>([]);
  const [loadingShows, setLoadingShows] = useState<boolean>(false);

  // 7-Day Date Array
  const dateStrip = useMemo(() => {
    const dates = [];
    const base = new Date('2026-11-01');
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthNames = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
    ];

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

  // Fetch shows when movie, date, or city changes
  useEffect(() => {
    if (selectedMovie) {
      setLoadingShows(true);
      api.getShows(selectedMovie.id, selectedDate, activeCity).then((data) => {
        setShowsList(data);
        setLoadingShows(false);
      });
    }
  }, [selectedMovie, selectedDate, activeCity]);

  const handleSelectShow = (show: Show) => {
    setSelectedShow(show);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToPayment = (seats: Seat[]) => {
    setSelectedSeats(seats);
    navigate('/payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If a show is selected, render the interactive Seat Grid
  if (selectedShow) {
    return (
      <SeatGrid
        show={selectedShow}
        movie={selectedMovie}
        userId={currentUser.email}
        onProceedToPayment={handleProceedToPayment}
        onBack={() => setSelectedShow(null)}
      />
    );
  }

  // Otherwise, render the Show Selection Matrix
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Nav Back / Switch */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Movies</span>
        </button>

        <span className="text-xs font-bold text-gray-400">
          City: <span className="text-emerald-400 font-extrabold">{activeCity}</span>
        </span>
      </div>

      {/* 1. Movie Summary Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#16191E] border border-white/10 p-6 flex flex-col sm:flex-row gap-6 items-center shadow-2xl">
        <div
          className="absolute inset-0 opacity-15 filter blur-xl scale-110 pointer-events-none"
          style={{
            backgroundImage: `url(${selectedMovie.backdropUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <img
          src={selectedMovie.posterUrl}
          alt={selectedMovie.title}
          className="w-28 sm:w-36 aspect-[2/3] object-cover rounded-2xl shadow-2xl border border-white/15 shrink-0 relative z-10"
        />

        <div className="space-y-3 flex-grow text-center sm:text-left relative z-10">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-black/60 text-xs font-bold text-white border border-white/10">
              {selectedMovie.rating}
            </span>
            <span className="text-xs text-amber-400 font-black flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {selectedMovie.imdbRating}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {selectedMovie.durationMinutes} mins
            </span>
            <span className="text-xs text-gray-400">• {selectedMovie.language}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white balanced-text">
            {selectedMovie.title}
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 max-w-2xl leading-relaxed">
            {selectedMovie.description}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
            {selectedMovie.formats.map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-bold text-emerald-200"
              >
                {fmt}
              </span>
            ))}
            <span className="text-xs text-gray-400 ml-1">
              {selectedMovie.genre.join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Horizontal 7-Day Date Selector Strip */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
            Select Show Date
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {dateStrip.map((item) => {
            const isActive = selectedDate === item.iso;
            return (
              <button
                key={item.iso}
                type="button"
                onClick={() => setSelectedDate(item.iso)}
                className={cn(
                  'flex flex-col items-center justify-center px-4 py-3 rounded-2xl min-w-[76px] transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'bg-gradient-to-b from-[#2D6A4F] to-[#1B3B2B] text-white shadow-lg shadow-[#2D6A4F]/50 border-2 border-emerald-400 scale-105'
                    : 'bg-[#16191E] border border-white/5 text-gray-400 hover:text-white hover:bg-[#1B3B2B]/30 hover:border-emerald-500/20'
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
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[#FF4D5E]" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
              Theatres & Showtimes
            </span>
          </div>
          <span className="text-xs text-gray-400">Click a time pill to select seats</span>
        </div>

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
                className="rounded-3xl bg-[#16191E] border border-white/10 p-5 sm:p-6 space-y-4 shadow-xl hover:border-white/20 transition-colors"
              >
                {/* Theatre Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#FF4D5E] shrink-0" />
                    <h4 className="text-base font-bold text-white">{theatre.name}</h4>
                  </div>
                  <span className="text-xs text-gray-400 sm:text-right">
                    {theatre.location} •{' '}
                    <span className="text-emerald-400 font-semibold">
                      {theatre.distanceKm} km away
                    </span>
                  </span>
                </div>

                {/* Showtime Pills Row */}
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
  );
}
