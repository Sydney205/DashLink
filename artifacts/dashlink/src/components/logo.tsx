interface LogoMarkProps {
  className?: string;
}

/**
 * DashLink brand mark: a chain link pierced by a lightning bolt.
 * Drawn as a single stroke icon so it reads clearly at small sizes
 * against the brutalist square badge used throughout the app.
 */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10.5 6.5H8a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 17.5H16a4 4 0 0 0 4-4v0a4 4 0 0 0-4-4h-1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 6.5 9.75 12.25H14L10.75 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LogoProps {
  size?: 'sm' | 'md';
  showWordmark?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<LogoProps['size']>, { box: string; icon: string; text: string }> = {
  sm: { box: 'w-8 h-8', icon: 'w-5 h-5', text: 'text-2xl' },
  md: { box: 'w-10 h-10', icon: 'w-6 h-6', text: 'text-2xl' },
};

export function Logo({ size = 'md', showWordmark = true, className }: LogoProps) {
  const sizes = SIZE_CLASSES[size];

  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <div
        className={`${sizes.box} bg-primary border-2 border-border brutal-shadow-sm flex items-center justify-center text-primary-foreground shrink-0`}
      >
        <LogoMark className={sizes.icon} />
      </div>
      {showWordmark && (
        <span className={`${sizes.text} font-black tracking-tight`}>DashLink</span>
      )}
    </div>
  );
}
