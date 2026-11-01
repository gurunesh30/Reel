/**
 * React Hook: usePrefetch
 * Implements Micro-UX Pattern #5 (Pre-rendering & Prefetching)
 * Prefetches showtimes on movie card hover/focus and seat topology on showtime pill hover.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { api } from '../services/api';

export function usePrefetch() {
  const queryClient = useQueryClient();

  /**
   * Prefetch showtimes payload when hovering or focusing a Movie Card
   */
  const prefetchShows = useCallback(
    (movieId: string, date: string, city = 'Metropolis') => {
      if (!movieId) return;
      queryClient.prefetchQuery({
        queryKey: ['shows', movieId, date, city],
        queryFn: () => api.getShows(movieId, date, city),
        staleTime: 60 * 1000, // 1 minute
      });
    },
    [queryClient]
  );

  /**
   * Prefetch seat map topology when hovering or focusing a Showtime pill
   */
  const prefetchSeats = useCallback(
    (showId: string) => {
      if (!showId) return;
      queryClient.prefetchQuery({
        queryKey: ['seatMap', showId],
        queryFn: () => api.getSeatMap(showId),
        staleTime: 30 * 1000, // 30 seconds
      });
    },
    [queryClient]
  );

  /**
   * Prefetch individual movie details
   */
  const prefetchMovie = useCallback(
    (movieId: string) => {
      if (!movieId) return;
      queryClient.prefetchQuery({
        queryKey: ['movie', movieId],
        queryFn: () => api.getMovieById(movieId),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },
    [queryClient]
  );

  return {
    prefetchShows,
    prefetchSeats,
    prefetchMovie,
  };
}
