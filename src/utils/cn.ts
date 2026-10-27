/** Tiny class joiner — avoids pulling in a dependency for one function. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
