export function CortexMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="6">
        <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" />
        <line x1="50" y1="50" x2="50" y2="6" />
        <line x1="50" y1="50" x2="88" y2="72" />
        <line x1="50" y1="50" x2="12" y2="72" />
      </g>
      <circle cx="50" cy="6" r="7" fill="currentColor" />
      <circle cx="88" cy="72" r="7" fill="currentColor" />
      <circle cx="12" cy="72" r="7" fill="currentColor" />
      <circle cx="50" cy="50" r="10" fill="#6366F1" />
    </svg>
  );
}

export function CortexLogo() {
  return (
    <span className="flex items-center gap-2.5 text-bone">
      <CortexMark className="h-7 w-7" />
      <span className="text-[15px] font-semibold tracking-[0.18em]">
        CORTEX<span className="ml-1.5 text-accent">AI</span>
      </span>
    </span>
  );
}
