/**
 * Global Keyboard-Driven Command Menu (Cmd+K / Ctrl+K)
 * Implements Micro-UX Pattern #3 using cmdk
 */

import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import {
  Film,
  MapPin,
  Ticket,
  Search,
  Sparkles,
  ChevronRight,
  User,
  Compass,
} from 'lucide-react';
import { Movie, Theatre } from '../../services/api';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movies: Movie[];
  theatres: Theatre[];
  activeCity: string;
  onSelectMovie: (movie: Movie) => void;
  onSelectTheatre: (theatre: Theatre) => void;
  onSelectCity: (city: string) => void;
  onOpenAuth: () => void;
  onNavigateHome: () => void;
}

export function CommandMenu({
  open,
  onOpenChange,
  movies,
  theatres,
  activeCity,
  onSelectMovie,
  onSelectTheatre,
  onSelectCity,
  onOpenAuth,
  onNavigateHome,
}: CommandMenuProps) {
  // Global Keyboard listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/80 backdrop-blur-md transition-opacity">
      {/* Click outside backdrop */}
      <div className="fixed inset-0 -z-10" onClick={() => onOpenChange(false)} />

      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-[#16191E] border border-white/10 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <Command className="w-full" label="Global Command Navigation">
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Search movies, theatres, cities, tickets..."
              className="w-full bg-transparent text-sm sm:text-base text-gray-100 placeholder-gray-500 outline-none"
            />
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-gray-400 bg-white/5 border border-white/10 rounded-md">
              ESC
            </span>
          </div>

          {/* Results List */}
          <Command.List className="max-h-[60vh] overflow-y-auto p-2 space-y-2 overscroll-contain">
            <Command.Empty className="py-8 text-center text-sm text-gray-500">
              No cinema matches found.
            </Command.Empty>

            {/* Movies Group */}
            <Command.Group heading="Movies Now Showing" className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2 py-1">
              {movies.map((movie) => (
                <Command.Item
                  key={movie.id}
                  value={`movie ${movie.title} ${movie.genre.join(' ')}`}
                  onSelect={() => {
                    onSelectMovie(movie);
                    onOpenChange(false);
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm text-gray-200 transition-colors hover:bg-[#26523C] hover:text-white data-[selected='true']:bg-[#26523C] data-[selected='true']:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Film className="w-4 h-4 text-[#346E52] shrink-0" />
                    <div>
                      <span className="font-medium text-white">{movie.title}</span>
                      <span className="text-xs text-gray-400 ml-2">★ {movie.imdbRating}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                    {movie.formats.join(', ')}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Theatres Group */}
            <Command.Group heading="Nearby Theatres" className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2 py-1 pt-2">
              {theatres.map((th) => (
                <Command.Item
                  key={th.id}
                  value={`theatre ${th.name} ${th.city} ${th.location}`}
                  onSelect={() => {
                    onSelectTheatre(th);
                    onOpenChange(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-sm text-gray-200 hover:bg-[#26523C] hover:text-white data-[selected='true']:bg-[#26523C] data-[selected='true']:text-white"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#E63946] shrink-0" />
                    <div>
                      <span className="font-medium">{th.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{th.location}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{th.distanceKm} km away</span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Cities / Locations */}
            <Command.Group heading="Switch City" className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2 py-1 pt-2">
              {['Metropolis', 'Gotham', 'Neo-Tokyo'].map((city) => (
                <Command.Item
                  key={city}
                  value={`city ${city}`}
                  onSelect={() => {
                    onSelectCity(city);
                    onOpenChange(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-sm text-gray-200 hover:bg-[#26523C] hover:text-white data-[selected='true']:bg-[#26523C] data-[selected='true']:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-medium">{city}</span>
                  </div>
                  {activeCity === city && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#1B3B2B] text-emerald-300 font-semibold">
                      Current
                    </span>
                  )}
                </Command.Item>
              ))}
            </Command.Group>

            {/* Quick Actions */}
            <Command.Group heading="Quick Navigation" className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2 py-1 pt-2">
              <Command.Item
                value="action landing home marquee"
                onSelect={() => {
                  onNavigateHome();
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-sm text-gray-200 hover:bg-[#26523C] hover:text-white data-[selected='true']:bg-[#26523C] data-[selected='true']:text-white"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Return to Landing Hero Marquee</span>
              </Command.Item>
              <Command.Item
                value="action sign in account user login"
                onSelect={() => {
                  onOpenAuth();
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-sm text-gray-200 hover:bg-[#26523C] hover:text-white data-[selected='true']:bg-[#26523C] data-[selected='true']:text-white"
              >
                <User className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Account & Sign In</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          {/* Footer Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#1F232B] border-t border-white/5 text-[11px] text-gray-400">
            <span>Navigate with ↑ ↓ and Press Enter</span>
            <span className="font-mono text-[#E63946]">Cmd+K</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
