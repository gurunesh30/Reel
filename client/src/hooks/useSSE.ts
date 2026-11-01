/**
 * React Hook: useSSE
 * Subscribes to real-time seat lock and booking broadcasts via StreamService
 */

import { useEffect, useState, useRef } from 'react';
import { streamService, SSEEvent } from '../services/streamService';
import { SeatStatus } from '../services/api';

interface UseSSEOptions {
  showId: string;
  currentUserId: string;
  onSeatUpdate: (seatId: string, newStatus: SeatStatus, event: SSEEvent) => void;
}

export function useSSE({ showId, currentUserId, onSeatUpdate }: UseSSEOptions) {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const onSeatUpdateRef = useRef(onSeatUpdate);

  useEffect(() => {
    onSeatUpdateRef.current = onSeatUpdate;
  }, [onSeatUpdate]);

  useEffect(() => {
    if (!showId) return;

    setIsConnected(true);

    // Subscribe to SSE stream for this show
    const subscription = streamService.getShowStream(showId).subscribe({
      next: (event) => {
        setLastEvent(event);

        let targetStatus: SeatStatus;
        if (event.type === 'SEAT_HELD') {
          targetStatus = event.userId === currentUserId ? 'held_by_you' : 'held_by_others';
        } else if (event.type === 'SEAT_RELEASED') {
          targetStatus = 'available';
        } else if (event.type === 'SEAT_BOOKED') {
          targetStatus = 'booked';
        } else {
          return;
        }

        onSeatUpdateRef.current(event.seatId, targetStatus, event);
      },
      error: () => {
        setIsConnected(false);
      },
    });

    // Start live SSE background broadcast simulation for interactive real-time experience
    const stopSimulation = streamService.startLiveSimulation(showId, currentUserId);

    return () => {
      subscription.unsubscribe();
      stopSimulation();
      setIsConnected(false);
    };
  }, [showId, currentUserId]);

  return {
    isConnected,
    lastEvent,
  };
}
