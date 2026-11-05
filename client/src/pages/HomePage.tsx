import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Search, Sparkles, Ticket, ShieldCheck } from 'lucide-react';
import { HeroCarousel } from '../components/catalog/HeroCarousel';
import { MovieCard } from '../components/catalog/MovieCard';
import { MOCK_MOVIES, Movie } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { usePrefetch } from '../hooks/usePrefetch';
import { cn } from '../utils/cn';

export function HomePage() {
  const { setSelectedMovie, activeCity, selectedDate } = useBooking();
  const navigate = useNavigate();
  const { prefetchShows } = usePrefetch();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const filteredMovies = useMemo(() => {
    return MOCK_MOVIES.filter((movie) => {
      const matchQuery =
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGenre = selectedGenre === 'All' || movie.genre.includes(selectedGenre);
      return matchQuery && matchGenre;
    });
  }, [searchQuery, selectedGenre]);

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    navigate('/booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      {/* 1. Cinematic Hero Carousel with 3D Stacked Deck */}
      <section className="relative">
        <HeroCarousel
          movies={MOCK_MOVIES}
          onSelectMovie={handleSelectMovie}
          onExploreCatalog={() => {
            const el = document.getElementById('catalog-matrix');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Experience Highlights Matrix with Glassmorphism */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card-forest-glass p-5 rounded-2xl group hover:border-emerald-400/60 transition-all shadow-lg hover:shadow-[0_8px_24px_rgba(45,106,79,0.25)]">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] text-emerald-300 font-extrabold tracking-wider uppercase">Screen Format</span>
              </div>
              <span className="text-sm font-black text-white block">IMAX Laser & 3D RealD</span>
              <span className="text-[11px] text-gray-400 mt-1 block">Ultra dynamic contrast</span>
            </div>

            <div className="card-forest-glass p-5 rounded-2xl group hover:border-emerald-400/60 transition-all shadow-lg hover:shadow-[0_8px_24px_rgba(45,106,79,0.25)]">
              <div className="flex items-center gap-2 mb-2">
                <Film className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] text-emerald-300 font-extrabold tracking-wider uppercase">Spatial Sound</span>
              </div>
              <span className="text-sm font-black text-white block">Dolby Atmos 128Ch</span>
              <span className="text-[11px] text-gray-400 mt-1 block">360-degree object audio</span>
            </div>

            <div className="card-forest-glass p-5 rounded-2xl group hover:border-emerald-400/60 transition-all shadow-lg hover:shadow-[0_8px_24px_rgba(45,106,79,0.25)]">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] text-emerald-300 font-extrabold tracking-wider uppercase">Seating Comfort</span>
              </div>
              <span className="text-sm font-black text-white block">VIP Plush Recliners</span>
              <span className="text-[11px] text-gray-400 mt-1 block">Dual-motor acoustic design</span>
            </div>

            <div className="card-forest-glass p-5 rounded-2xl group hover:border-emerald-400/60 transition-all shadow-lg hover:shadow-[0_8px_24px_rgba(45,106,79,0.25)]">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] text-emerald-300 font-extrabold tracking-wider uppercase">Protected Booking</span>
              </div>
              <span className="text-sm font-black text-white block">256-Bit SSL Encrypted</span>
              <span className="text-[11px] text-gray-400 mt-1 block">Instant QR mobile pass</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Movie Discovery & Catalog Matrix */}
      <section id="catalog-matrix" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF4D5E]">
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#16191E] border border-white/10 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Genre Filter Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {['All', 'Sci-Fi', 'Action', 'Cyberpunk', 'Mystery', 'Drama', 'Adventure'].map(
            (genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(genre)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 cursor-pointer',
                  selectedGenre === genre
                    ? 'bg-[#2D6A4F] text-white shadow-lg shadow-[#2D6A4F]/40 border border-emerald-400/60 scale-105'
                    : 'bg-[#16191E] text-gray-400 hover:text-white hover:bg-[#1B3B2B]/40 border border-white/5 hover:border-emerald-500/20'
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
              type="button"
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
    </div>
  );
}
