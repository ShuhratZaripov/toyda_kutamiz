const MAX_GENTLE_PULSE_MS = 12;
const completedMoments = new Set<string>();

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function gentleVibrate(milliseconds: number): boolean {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.vibrate !== "function" ||
    !Number.isFinite(milliseconds) ||
    milliseconds <= 0 ||
    prefersReducedMotion()
  ) {
    return false;
  }

  const duration = Math.min(Math.round(milliseconds), MAX_GENTLE_PULSE_MS);

  try {
    return navigator.vibrate(duration);
  } catch {
    // Haptics are an optional enhancement and must never block the action.
    return false;
  }
}

export function gentleVibrateOnce(
  moment: string,
  milliseconds: number,
): boolean {
  if (completedMoments.has(moment)) {
    return false;
  }

  completedMoments.add(moment);
  return gentleVibrate(milliseconds);
}
