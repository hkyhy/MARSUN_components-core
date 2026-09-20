/**
 * Resolve a Tour target from CSS selector or `data-tour` id.
 * Returns null when missing — callers must skip that step (do not fall back to body).
 */
export function resolveTourTarget(selector: string): HTMLElement | null {
  if (typeof document === 'undefined' || !selector) return null;
  try {
    return document.querySelector(selector) as HTMLElement | null;
  } catch {
    return null;
  }
}

/** Convenience: `[data-tour="<id>"]` */
export function getTargetByTourId(tourId: string): HTMLElement | null {
  if (!tourId) return null;
  return resolveTourTarget(`[data-tour="${tourId}"]`);
}
