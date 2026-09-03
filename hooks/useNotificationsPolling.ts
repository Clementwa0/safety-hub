"use client";

import { useEffect, useRef } from "react";

import { notificationService } from "@/services/sentinel/notification.service";
import { useNotificationsStore } from "@/store/notifications-store";

const POLL_INTERVAL_MS = 20_000;

/**
 * Keeps the notification store in sync with the backend without the user
 * ever refreshing the page.
 *
 * Design goals this satisfies:
 * - Cheap by default: every tick hits GET /api/notifications/unread-count
 *   (a count + a single-doc findOne), not the full list.
 * - Only fetches the full list (delta via `since`) when the count endpoint
 *   reports something newer than what's already in the store, so a quiet
 *   inbox never triggers unnecessary list requests.
 * - Pauses entirely while the tab is hidden/backgrounded, and does one
 *   catch-up poll the moment it becomes visible again, instead of firing
 *   on a fixed timer regardless of whether anyone's looking.
 * - `inFlight` ref stops a slow request from overlapping with the next
 *   scheduled tick, which is what would otherwise cause duplicate merges.
 */
export function useNotificationsPolling() {
  const fetchInitial = useNotificationsStore((state) => state.fetchInitial);
  const poll = useNotificationsStore((state) => state.poll);
  const hasLoaded = useNotificationsStore((state) => state.hasLoaded);

  const inFlight = useRef(false);
  const latestSeenAt = useRef<string | null>(null);

  useEffect(() => {
    if (!hasLoaded) {
      fetchInitial();
    }
  }, [hasLoaded, fetchInitial]);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      if (document.hidden || inFlight.current || cancelled) return;

      inFlight.current = true;
      try {
        const { unreadCount, latestAt } = await notificationService.unreadCount();
        const current = useNotificationsStore.getState();

        // Nothing new since the last time we checked, and the local
        // unread count already agrees - skip the (more expensive) list
        // fetch entirely.
        if (latestAt === latestSeenAt.current && unreadCount === current.unreadCount) {
          return;
        }

        latestSeenAt.current = latestAt;
        await poll();
      } catch {
        // A single failed poll shouldn't take down the badge - just try again next tick.
      } finally {
        inFlight.current = false;
      }
    };

    const interval = setInterval(tick, POLL_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [poll]);
}
