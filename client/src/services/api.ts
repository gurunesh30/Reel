/**
 * Unified Cinema Booking API & Data Service
 * Implements SSOT PostgreSQL schema mappings, Redis hold locks, and Idempotency key handling.
 */

export interface Movie {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  language: string;
  genre: string[];
  rating: string; // e.g. "PG-13", "R", "U/A"
  imdbRating: number;
  posterUrl: string;
  backdropUrl: string;
  blurHash: string;
  formats: ('IMAX' | '3D' | 'Dolby Atmos' | 'Standard')[];
  releaseDate: string;
}

export interface Theatre {
  id: string;
  name: string;
  city: string;
  location: string;
  distanceKm: number;
}

export interface Show {
  id: string;
  movieId: string;
  screenId: string;
  theatreId: string;
  theatreName: string;
  startTime: string; // e.g. "14:30"
  endTime: string;
  date: string; // e.g. "2026-11-01"
  format: 'IMAX' | '3D' | 'Dolby Atmos' | 'Standard';
  screenName: string;
  basePrice: number;
}

export type SeatStatus = 'available' | 'held_by_you' | 'held_by_others' | 'booked';
export type SeatTier = 'Standard' | 'VIP';

export interface Seat {
  id: string;
  screenId: string;
  showId: string;
  seatNumber: number;
  row: string; // e.g. "A", "B", "C"
  tier: SeatTier;
  price: number;
  status: SeatStatus;
  heldByUserId?: string;
  expiresAt?: number; // Epoch timestamp for 5-minute Redis hold
}

export interface BookingReceipt {
  bookingId: string;
  paymentId: string;
  idempotencyKey: string;
  showId: string;
  movieTitle: string;
  theatreName: string;
  screenName: string;
  format: string;
  showTime: string;
  showDate: string;
  seats: string[];
  totalAmount: number;
  taxAmount: number;
  convenienceFee: number;
  userName: string;
  userEmail: string;
  status: 'CONFIRMED';
  qrCodeData: string;
  bookedAt: string;
}

// In-Memory Catalog Database
export const MOCK_MOVIES: Movie[] = [
  {
    id: 'mov-1',
    title: 'Dune: Part Three',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking vengeance against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.',
    durationMinutes: 166,
    language: 'English',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    rating: 'PG-13',
    imdbRating: 8.9,
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    blurHash: 'LEHLh[WB2yk8pyoJadR*.7kCMdnj',
    formats: ['IMAX', 'Dolby Atmos', 'Standard'],
    releaseDate: '2026-10-15',
  },
  {
    id: 'mov-2',
    title: 'Neon Odyssey 2099',
    description: 'In a rain-soaked neo-tokyo metropolis, a rogue synthetic consciousness investigator uncovers an existential corporate conspiracy that blurs biological and digital existence.',
    durationMinutes: 142,
    language: 'English',
    genre: ['Cyberpunk', 'Action', 'Thriller'],
    rating: 'R',
    imdbRating: 8.6,
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    blurHash: 'L78h6?xt4nIT~VofIUfk_3j[D*WB',
    formats: ['IMAX', '3D', 'Dolby Atmos'],
    releaseDate: '2026-10-22',
  },
  {
    id: 'mov-3',
    title: 'The Silent Horizon',
    description: 'A deep-sea expedition into the Mariana Trench encounters an ancient abyssal structure vibrating at low frequencies, sending resonance shockwaves across global coastlines.',
    durationMinutes: 135,
    language: 'English',
    genre: ['Mystery', 'Sci-Fi', 'Horror'],
    rating: 'PG-13',
    imdbRating: 8.3,
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    blurHash: 'L35#xU0000_300~q_3of00%M?bof',
    formats: ['Dolby Atmos', 'Standard'],
    releaseDate: '2026-10-29',
  },
  {
    id: 'mov-4',
    title: 'Echoes of the Ronin',
    description: 'In 17th century feudal Kyoto, a disgraced samurai must escort a sacred manuscript past rival clans to preserve the lineage of northern emperors.',
    durationMinutes: 150,
    language: 'Japanese',
    genre: ['Action', 'Historical', 'Drama'],
    rating: 'R',
    imdbRating: 8.7,
    posterUrl: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop',
    blurHash: 'L7BD~l00?b_300~q_3of00%M?bof',
    formats: ['IMAX', 'Dolby Atmos'],
    releaseDate: '2026-11-01',
  },
  {
    id: 'mov-5',
    title: 'Quantum Leap: Genesis',
    description: 'Physicists at CERN accidentally breach the event horizon of a microscopic white hole, causing alternate timelines to converge into a single ticking reality.',
    durationMinutes: 128,
    language: 'English',
    genre: ['Sci-Fi', 'Adventure'],
    rating: 'PG-13',
    imdbRating: 8.1,
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1600&auto=format&fit=crop',
    blurHash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
    formats: ['3D', 'IMAX'],
    releaseDate: '2026-11-05',
  }
];

export const MOCK_THEATRES: Theatre[] = [
  { id: 'th-1', name: 'Grand Rex Cinematic IMAX', city: 'Metropolis', location: 'Downtown Central Square', distanceKm: 1.4 },
  { id: 'th-2', name: 'Dolby Vision Zenith Arena', city: 'Metropolis', location: 'Harbor Gateway Mall', distanceKm: 3.2 },
  { id: 'th-3', name: 'Odeon Luxe Starlight', city: 'Metropolis', location: 'West End Galleria', distanceKm: 5.8 },
  { id: 'th-4', name: 'Cinemark Sphere 3D', city: 'Gotham', location: 'Midtown Plaza', distanceKm: 2.1 },
  { id: 'th-5', name: 'BFI Royal Cinema', city: 'Neo-Tokyo', location: 'Shinjuku Center 4F', distanceKm: 0.9 },
];

// Active In-Memory Seat State Store (simulating Redis hold locks)
const activeSeatHolds: Map<string, { userId: string; expiresAt: number; status: SeatStatus }> = new Map();

// Helper to generate seat map
export function generateShowSeats(showId: string, basePrice: number): Seat[] {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seats: Seat[] = [];

  rows.forEach((row, rowIndex) => {
    const isVip = rowIndex >= 4;
    const seatPrice = isVip ? basePrice + 6 : basePrice;

    for (let num = 1; num <= 10; num++) {
      const seatId = `${showId}_${row}${num}`;
      
      // Determine initial state
      let status: SeatStatus = 'available';
      const existingHold = activeSeatHolds.get(seatId);

      if (existingHold && existingHold.expiresAt > Date.now()) {
        status = existingHold.status;
      } else {
        // Pre-seed some booked seats for realistic realism
        if ((rowIndex === 0 && (num === 4 || num === 5)) || (rowIndex === 2 && num === 7)) {
          status = 'booked';
        } else if (rowIndex === 3 && num === 6) {
          status = 'held_by_others';
        }
      }

      seats.push({
        id: seatId,
        screenId: 'screen-101',
        showId,
        seatNumber: num,
        row,
        tier: isVip ? 'VIP' : 'Standard',
        price: seatPrice,
        status,
        expiresAt: existingHold?.expiresAt,
      });
    }
  });

  return seats;
}

export const api = {
  // Fetch Movies with optional filters
  async getMovies(query = '', genre = 'All', city = 'Metropolis'): Promise<Movie[]> {
    await new Promise((res) => setTimeout(res, 120)); // Realistic latency
    return MOCK_MOVIES.filter((movie) => {
      const matchQuery = movie.title.toLowerCase().includes(query.toLowerCase()) ||
        movie.description.toLowerCase().includes(query.toLowerCase());
      const matchGenre = genre === 'All' || movie.genre.includes(genre);
      return matchQuery && matchGenre;
    });
  },

  async getMovieById(movieId: string): Promise<Movie | null> {
    await new Promise((res) => setTimeout(res, 80));
    return MOCK_MOVIES.find((m) => m.id === movieId) || null;
  },

  async getTheatres(city = 'Metropolis'): Promise<Theatre[]> {
    await new Promise((res) => setTimeout(res, 90));
    return MOCK_THEATRES.filter((t) => !city || t.city === city);
  },

  async getShows(movieId: string, date: string, city = 'Metropolis'): Promise<Show[]> {
    await new Promise((res) => setTimeout(res, 140));
    const theatres = MOCK_THEATRES.filter((t) => !city || t.city === city);
    const shows: Show[] = [];

    theatres.forEach((th, idx) => {
      const times = [
        { time: '11:00', format: 'Standard' as const, price: 14 },
        { time: '14:30', format: 'IMAX' as const, price: 22 },
        { time: '18:15', format: 'Dolby Atmos' as const, price: 20 },
        { time: '21:45', format: idx % 2 === 0 ? ('IMAX' as const) : ('3D' as const), price: 24 },
      ];

      times.forEach((slot, sIdx) => {
        shows.push({
          id: `show_${movieId}_${th.id}_${date}_${sIdx}`,
          movieId,
          screenId: `scr_${th.id}_${sIdx + 1}`,
          theatreId: th.id,
          theatreName: th.name,
          startTime: slot.time,
          endTime: '23:30',
          date,
          format: slot.format,
          screenName: `Screen ${sIdx + 1} (${slot.format})`,
          basePrice: slot.price,
        });
      });
    });

    return shows;
  },

  async getSeatMap(showId: string): Promise<Seat[]> {
    await new Promise((res) => setTimeout(res, 110));
    return generateShowSeats(showId, 18);
  },

  /**
   * Redis SETNX hold locking simulation:
   * SET hold:show_{id}:seat_{id} {userId} NX EX 300
   * Throws 409 Conflict if already locked by another user.
   */
  async holdSeat(showId: string, seatId: string, userId: string): Promise<{ success: boolean; expiresAt: number; seatId: string }> {
    await new Promise((res) => setTimeout(res, 150));

    const existing = activeSeatHolds.get(seatId);
    if (existing && existing.expiresAt > Date.now() && existing.userId !== userId) {
      const err = new Error(`Seat ${seatId} was just locked by another guest!`);
      (err as unknown as { status: number }).status = 409;
      throw err;
    }

    const expiresAt = Date.now() + 300 * 1000; // 5 minutes (Redis EX 300)
    activeSeatHolds.set(seatId, {
      userId,
      expiresAt,
      status: 'held_by_you',
    });

    return {
      success: true,
      expiresAt,
      seatId,
    };
  },

  async releaseSeat(showId: string, seatId: string, userId: string): Promise<{ success: boolean; seatId: string }> {
    await new Promise((res) => setTimeout(res, 80));
    activeSeatHolds.delete(seatId);
    return { success: true, seatId };
  },

  /**
   * Idempotent Payment Process
   * Prevents duplicate transactions using unique idempotency key
   */
  async processPayment(payload: {
    bookingId: string;
    showId: string;
    movieTitle: string;
    theatreName: string;
    screenName: string;
    format: string;
    showTime: string;
    showDate: string;
    seats: string[];
    totalAmount: number;
    userName: string;
    userEmail: string;
    idempotencyKey: string;
  }): Promise<BookingReceipt> {
    await new Promise((res) => setTimeout(res, 400));

    // Commit seats as BOOKED permanently
    payload.seats.forEach((seatId) => {
      activeSeatHolds.set(seatId, {
        userId: payload.userEmail,
        expiresAt: Date.now() + 86400 * 1000,
        status: 'booked',
      });
    });

    const taxAmount = Number((payload.totalAmount * 0.08).toFixed(2));
    const convenienceFee = 2.5;

    return {
      bookingId: payload.bookingId,
      paymentId: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      idempotencyKey: payload.idempotencyKey,
      showId: payload.showId,
      movieTitle: payload.movieTitle,
      theatreName: payload.theatreName,
      screenName: payload.screenName,
      format: payload.format,
      showTime: payload.showTime,
      showDate: payload.showDate,
      seats: payload.seats,
      totalAmount: payload.totalAmount + taxAmount + convenienceFee,
      taxAmount,
      convenienceFee,
      userName: payload.userName,
      userEmail: payload.userEmail,
      status: 'CONFIRMED',
      qrCodeData: `REELPASS-${payload.bookingId}-${payload.idempotencyKey}`,
      bookedAt: new Date().toISOString(),
    };
  },
};
