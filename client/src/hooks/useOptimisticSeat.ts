/**
 * React Hook: useOptimisticSeat
 * Implements Micro-UX Pattern #2 (Optimistic Updates & 409 Reversion)
 * and Micro-UX Pattern #4 (Undo trigger integration)
 */

import { useState, useCallback, useMemo } from 'react';
import { Seat, SeatStatus, api } from '../services/api';
import { streamService } from '../services/streamService';

interface UseOptimisticSeatOptions {
  showId: string;
  userId: string;
  initialSeats: Seat[];
  onConflict?: (seatId: string, message: string) => void;
  onDeselectUndo?: (seat: Seat, undo: () => void) => void;
}

export function useOptimisticSeat({
  showId,
  userId,
  initialSeats,
  onConflict,
  onDeselectUndo,
}: UseOptimisticSeatOptions) {
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);

  // Selected seats (held by current user)
  const selectedSeats = useMemo(() => {
    return seats.filter((s) => s.status === 'held_by_you');
  }, [seats]);

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeats]);

  // Update a single seat from SSE or remote event
  const updateSeatStatus = useCallback((seatId: string, newStatus: SeatStatus) => {
    setSeats((prevSeats) =>
      prevSeats.map((seat) => {
        if (seat.id !== seatId) return seat;
        // Do not overwrite user's own active hold unless explicit conflict/expiry
        if (seat.status === 'held_by_you' && newStatus === 'held_by_others') {
          return seat;
        }
        return { ...seat, status: newStatus };
      })
    );
  }, []);

  // Set entire seat array (e.g. initial load or show change)
  const setAllSeats = useCallback((newSeats: Seat[]) => {
    setSeats(newSeats);
  }, []);

  // Toggle seat selection with optimistic UI and 409 Conflict rollback
  const toggleSeat = useCallback(
    async (seatId: string) => {
      const targetSeat = seats.find((s) => s.id === seatId);
      if (!targetSeat) return;

      // Disallow clicking booked or held by others
      if (targetSeat.status === 'booked' || targetSeat.status === 'held_by_others') {
        return;
      }

      // 1. DESELECTION FLOW
      if (targetSeat.status === 'held_by_you') {
        // Optimistically set to available
        setSeats((prev) =>
          prev.map((s) => (s.id === seatId ? { ...s, status: 'available' as SeatStatus } : s))
        );

        // Notify stream service of release
        streamService.broadcastEvent({
          type: 'SEAT_RELEASED',
          showId,
          seatId,
          userId,
          timestamp: Date.now(),
        });

        // Trigger transient undo toast (Micro-UX #4)
        if (onDeselectUndo) {
          onDeselectUndo(targetSeat, () => {
            // Undo action: re-hold
            toggleSeat(seatId);
          });
        }

        try {
          await api.releaseSeat(showId, seatId, userId);
        } catch (err) {
          console.error('Failed to release seat on server:', err);
        }
        return;
      }

      // 2. SELECTION FLOW (Optimistic Hold)
      const previousStatus = targetSeat.status;

      // Optimistically mark as Held by You immediately
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'held_by_you' as SeatStatus } : s))
      );

      // Start 5-minute countdown hold if not already running
      setHoldExpiresAt((current) => current || Date.now() + 300 * 1000);

      try {
        const response = await api.holdSeat(showId, seatId, userId);
        if (response.expiresAt) {
          setHoldExpiresAt(response.expiresAt);
        }

        // Broadcast to other SSE clients
        streamService.broadcastEvent({
          type: 'SEAT_HELD',
          showId,
          seatId,
          userId,
          timestamp: Date.now(),
          expiresAt: response.expiresAt,
        });
      } catch (error: unknown) {
        // 409 Conflict or Network Error: Rollback state immediately
        const status = (error as { status?: number }).status;
        const fallbackStatus = status === 409 ? 'held_by_others' : previousStatus;

        setSeats((prev) =>
          prev.map((s) => (s.id === seatId ? { ...s, status: fallbackStatus as SeatStatus } : s))
        );

        const errorMsg =
          status === 409
            ? `Seat ${targetSeat.row}${targetSeat.seatNumber} was just taken by another user!`
            : 'Unable to hold seat. Please try again.';

        if (onConflict) {
          onConflict(seatId, errorMsg);
        }
      }
    },
    [seats, showId, userId, onConflict, onDeselectUndo]
  );

  const clearAllHolds = useCallback(() => {
    selectedSeats.forEach((seat) => {
      api.releaseSeat(showId, seat.id, userId);
      streamService.broadcastEvent({
        type: 'SEAT_RELEASED',
        showId,
        seatId: seat.id,
        userId,
        timestamp: Date.now(),
      });
    });
    setSeats((prev) =>
      prev.map((s) => (s.status === 'held_by_you' ? { ...s, status: 'available' } : s))
    );
    setHoldExpiresAt(null);
  }, [selectedSeats, showId, userId]);

  return {
    seats,
    selectedSeats,
    totalPrice,
    holdExpiresAt,
    toggleSeat,
    updateSeatStatus,
    setAllSeats,
    clearAllHolds,
  };
}
