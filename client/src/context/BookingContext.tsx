import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movie, Show, Seat, BookingReceipt, MOCK_MOVIES } from '../services/api';

export interface UserProfile {
  name: string;
  email: string;
  isGuest?: boolean;
  tier?: string;
}

interface BookingContextType {
  // Auth state
  currentUser: UserProfile;
  login: (user: UserProfile) => void;
  logout: () => void;
  // Navigation / location state
  activeCity: string;
  setActiveCity: (city: string) => void;
  // Selected movie & schedule state
  selectedMovie: Movie;
  setSelectedMovie: (movie: Movie) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedShow: Show | null;
  setSelectedShow: (show: Show | null) => void;
  // Selected seats & checkout state
  selectedSeats: Seat[];
  setSelectedSeats: (seats: Seat[]) => void;
  receipt: BookingReceipt | null;
  setReceipt: (receipt: BookingReceipt | null) => void;
  // Global modal shortcuts
  isCommandMenuOpen: boolean;
  setIsCommandMenuOpen: (open: boolean) => void;
}

const DEFAULT_USER: UserProfile = {
  name: 'Cinephile Member',
  email: 'member@reelcinema.com',
  tier: 'VIP Pass Holder',
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  // Initialize user from localStorage if present
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('reel_auth_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_USER;
  });

  const [activeCity, setActiveCity] = useState<string>('Metropolis');
  const [selectedMovie, setSelectedMovie] = useState<Movie>(MOCK_MOVIES[0]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-01');
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState<boolean>(false);

  // Sync user changes to localStorage
  const login = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('reel_auth_user', JSON.stringify(user));
    } catch {
      // Ignore storage errors
    }
  };

  const logout = () => {
    const guestUser: UserProfile = {
      name: 'Guest Cinephile',
      email: 'guest@reelcinema.com',
      isGuest: true,
      tier: 'Standard',
    };
    setCurrentUser(guestUser);
    try {
      localStorage.removeItem('reel_auth_user');
    } catch {
      // Ignore
    }
  };

  return (
    <BookingContext.Provider
      value={{
        currentUser,
        login,
        logout,
        activeCity,
        setActiveCity,
        selectedMovie,
        setSelectedMovie,
        selectedDate,
        setSelectedDate,
        selectedShow,
        setSelectedShow,
        selectedSeats,
        setSelectedSeats,
        receipt,
        setReceipt,
        isCommandMenuOpen,
        setIsCommandMenuOpen,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
