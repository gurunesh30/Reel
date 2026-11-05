/**
 * Cinema Theatre Booking System - Unified Application Flow
 * Orchestrates Routes (/home, /booking, /payment, /login) with Cinematic Dark Crimson Theme,
 * Flowing Ambient Backgrounds, and Advanced Micro-UX Patterns.
 */

import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { BookingProvider, useBooking } from './context/BookingContext';
import { CinematicBackground } from './components/layout/CinematicBackground';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage';
import { BookingPage } from './pages/BookingPage';
import { PaymentPage } from './pages/PaymentPage';
import { LoginPage } from './pages/LoginPage';
import { CommandMenu } from './components/shared/CommandMenu';
import { MOCK_MOVIES, MOCK_THEATRES, Movie, Theatre } from './services/api';
import { ShieldCheck, Film, Heart } from 'lucide-react';

function AppContent() {
  const {
    isCommandMenuOpen,
    setIsCommandMenuOpen,
    activeCity,
    setActiveCity,
    setSelectedMovie,
  } = useBooking();

  const navigate = useNavigate();

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    navigate('/booking');
  };

  const handleSelectTheatre = (theatre: Theatre) => {
    setActiveCity(theatre.city);
    navigate('/booking');
  };

  const handleSelectCity = (city: string) => {
    setActiveCity(city);
  };

  return (
    <div className="relative min-h-screen flex flex-col text-white selection:bg-[#E63946] selection:text-white">
      {/* 1. Flowing Dark Crimson Ambient Background */}
      <CinematicBackground />

      {/* 2. Top Navigation Bar */}
      <Navbar />

      {/* 3. Dynamic Route Outlet */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>

      {/* 4. Global Command Menu (Cmd+K) */}
      <CommandMenu
        open={isCommandMenuOpen}
        onOpenChange={setIsCommandMenuOpen}
        movies={MOCK_MOVIES}
        theatres={MOCK_THEATRES}
        activeCity={activeCity}
        onSelectMovie={handleSelectMovie}
        onSelectTheatre={handleSelectTheatre}
        onSelectCity={handleSelectCity}
        onOpenAuth={() => navigate('/login')}
        onNavigateHome={() => navigate('/home')}
      />

      {/* 5. Cinematic Global Footer */}
      <footer className="w-full border-t border-white/10 bg-[#0A0C10]/90 backdrop-blur-xl py-8 px-4 sm:px-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#9B111E] to-[#E63946] flex items-center justify-center text-white font-black text-xs">
              R
            </div>
            <span className="font-semibold text-white">REEL Cinema Systems</span>
            <span>•</span>
            <span>Laser IMAX & Dolby Atmos</span>
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Distributed Locking Active
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-[#E63946] fill-[#E63946]" /> for Cinephiles
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BookingProvider>
      <AppContent />
    </BookingProvider>
  );
}
