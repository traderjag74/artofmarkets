/** Mark: a single brush-like equity stroke inside a frame, like a printed figure. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" fill="none">
      <rect x="1.5" y="1.5" width="29" height="29" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 23 C9 22, 10 15, 13 17 S17 24, 20 15 S25 9, 27 8" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 27 H27" stroke="currentColor" strokeWidth="1" opacity=".4" />
    </svg>
  );
}
