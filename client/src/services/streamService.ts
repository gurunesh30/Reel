/**
 * Reactive Real-Time Event Stream Service (Redis Pub/Sub + SSE Simulation)
 * Uses RxJS to broadcast unidirectional live seat locking and release events.
 */

import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export type SSEEventType = 'SEAT_HELD' | 'SEAT_RELEASED' | 'SEAT_BOOKED' | 'HEARTBEAT';

export interface SSEEvent {
  type: SSEEventType;
  showId: string;
  seatId: string;
  userId?: string;
  timestamp: number;
  expiresAt?: number;
}

class StreamService {
  private readonly eventBus$ = new Subject<SSEEvent>();
  private activeSimulations: Map<string, number> = new Map();

  /**
   * Broadcast an event across all active subscriber streams
   */
  public broadcastEvent(event: SSEEvent): void {
    this.eventBus$.next(event);
  }

  /**
   * Subscribe to real-time events for a specific show
   */
  public getShowStream(showId: string): Observable<SSEEvent> {
    return this.eventBus$.asObservable().pipe(
      filter((event) => event.showId === showId)
    );
  }

  /**
   * Simulates remote users concurrently locking/releasing seats via SSE
   */
  public startLiveSimulation(showId: string, currentUserId: string): () => void {
    if (this.activeSimulations.has(showId)) {
      return () => this.stopLiveSimulation(showId);
    }

    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const timerId = window.setInterval(() => {
      // Pick a random seat to hold or release by a remote guest
      const randomRow = rows[Math.floor(Math.random() * rows.length)];
      const randomNum = Math.floor(Math.random() * 10) + 1;
      const seatId = `${showId}_${randomRow}${randomNum}`;
      
      const isHold = Math.random() > 0.4;
      const remoteUserId = `guest_${Math.floor(Math.random() * 900) + 100}`;

      if (remoteUserId !== currentUserId) {
        this.broadcastEvent({
          type: isHold ? 'SEAT_HELD' : 'SEAT_RELEASED',
          showId,
          seatId,
          userId: remoteUserId,
          timestamp: Date.now(),
          expiresAt: isHold ? Date.now() + 300 * 1000 : undefined,
        });
      }
    }, 8500); // Trigger every 8.5 seconds for active real-time atmosphere

    this.activeSimulations.set(showId, timerId);

    return () => this.stopLiveSimulation(showId);
  }

  public stopLiveSimulation(showId: string): void {
    const timerId = this.activeSimulations.get(showId);
    if (timerId !== undefined) {
      clearInterval(timerId);
      this.activeSimulations.delete(showId);
    }
  }
}

export const streamService = new StreamService();
