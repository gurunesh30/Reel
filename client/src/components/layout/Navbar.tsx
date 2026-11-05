import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Film, Compass, Search, User, Ticket, CreditCard, LogIn } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { cn } from '../../utils/cn';

export function Navbar() {
  const { currentUser, activeCity, setIsCommandMenuOpen, selectedSeats } = useBooking();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0F1115]/85 backdrop-blur-xl px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <NavLink
          to="/home"
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#9B111E] to-[#E63946] flex items-center justify-center shadow-lg shadow-[#E63946]/30 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(230,57,70,0.6)] transition-all">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-wider text-white flex items-center gap-1">
              REEL <span className="text-[10px] text-[#FF4D5E] font-mono font-bold tracking-widest bg-[#9B111E]/30 px-1.5 py-0.5 rounded border border-[#E63946]/40">CINEMA</span>
            </span>
            <span className="text-[9px] text-gray-400 font-semibold tracking-widest -mt-1 uppercase">
              Laser IMAX Experience
            </span>
          </div>
        </NavLink>

        {/* Center Route Links */}
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              cn(
                'px-3.5 py-1.5 rounded-xl transition-all',
                isActive
                  ? 'bg-white/10 text-white font-bold shadow-sm border border-white/10 text-emerald-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/booking"
            className={({ isActive }) =>
              cn(
                'px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5',
                isActive
                  ? 'bg-[#1B3B2B]/90 text-emerald-300 font-bold border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                  : 'text-gray-400 hover:text-emerald-300 hover:bg-[#1B3B2B]/30'
              )
            }
          >
            <Ticket className="w-3.5 h-3.5 text-emerald-400" />
            <span>Booking</span>
          </NavLink>

          <NavLink
            to="/payment"
            className={({ isActive }) =>
              cn(
                'px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 relative',
                isActive
                  ? 'bg-[#9B111E]/40 text-red-200 font-bold border border-[#E63946]/50 shadow-[0_0_15px_rgba(230,57,70,0.3)]'
                  : 'text-gray-400 hover:text-red-300 hover:bg-[#9B111E]/20'
              )
            }
          >
            <CreditCard className="w-3.5 h-3.5 text-[#FF4D5E]" />
            <span>Payment</span>
            {selectedSeats.length > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-[#E63946] text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {selectedSeats.length}
              </span>
            )}
          </NavLink>
        </div>

        {/* Right Controls: City Pill + Cmd+K + Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* City Pill */}
          <button
            type="button"
            onClick={() => setIsCommandMenuOpen(true)}
            title="Change City"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B3B2B]/80 border border-emerald-500/50 hover:border-emerald-400 text-xs font-semibold text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.2)] transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xs:inline">{activeCity}</span>
          </button>

          {/* Command Menu Shortcut Trigger (Cmd+K) */}
          <button
            type="button"
            onClick={() => setIsCommandMenuOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#1B3B2B]/40 border border-white/10 hover:border-emerald-500/40 text-xs text-gray-400 hover:text-emerald-200 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
              Cmd+K
            </span>
          </button>

          {/* User Account / Sign In */}
          <NavLink
            to="/login"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer',
                isActive
                  ? 'bg-gradient-to-r from-[#9B111E] to-[#E63946] text-white border border-[#FF4D5E] shadow-[0_0_16px_rgba(230,57,70,0.5)]'
                  : currentUser.isGuest
                  ? 'bg-white/5 hover:bg-[#9B111E]/30 text-gray-200 border border-white/10 hover:border-[#E63946]/50'
                  : 'bg-[#26523C] hover:bg-[#2D6A4F] text-white border border-emerald-400/50 shadow-[0_0_14px_rgba(45,106,79,0.4)]'
              )
            }
          >
            {currentUser.isGuest ? (
              <>
                <LogIn className="w-3.5 h-3.5 text-[#FF4D5E]" />
                <span className="hidden sm:inline">Sign In</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
              </>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
