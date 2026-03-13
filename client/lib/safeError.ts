/**
 * Safe, user-facing error messages. Never expose backend details, paths, or stack traces.
 */

export const SAFE_MESSAGES = {
  generic: "Something went wrong. Please try again.",
  auth: "Invalid email or password. Please try again.",
  forbidden: "You don't have permission to do that.",
  notFound: "The requested item was not found.",
  network: "Connection problem. Please check your network and try again.",
} as const;

const ALLOWED = new Set<string>(Object.values(SAFE_MESSAGES));

/** Map HTTP status to a safe message (no backend leakage). */
export function getMessageForStatus(status: number): string {
  if (status === 401) return SAFE_MESSAGES.auth;
  if (status === 403) return SAFE_MESSAGES.forbidden;
  if (status === 404) return SAFE_MESSAGES.notFound;
  if (status >= 500) return SAFE_MESSAGES.generic;
  if (status >= 400) return SAFE_MESSAGES.generic;
  return SAFE_MESSAGES.generic;
}

/**
 * Return a safe message for display in the UI. Uses our safe strings or short backend messages (no paths/stacks).
 */
export function getSafeErrorMessage(err: unknown, fallback: string = SAFE_MESSAGES.generic): string {
  if (err == null) return fallback;
  if (typeof err === "string") return fallback;
  if (err instanceof Error && err.message) {
    if (ALLOWED.has(err.message)) return err.message;
    // Allow short, user-facing backend messages (no stack traces or file paths)
    if (err.message.length < 200 && !/\.(ts|js|tsx|jsx):\d|at\s+\S+\s+\(|^\s+at\s/m.test(err.message))
      return err.message;
  }
  return fallback;
}
