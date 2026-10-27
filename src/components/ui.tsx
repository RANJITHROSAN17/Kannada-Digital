import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';

/** Kannada script text gets its own font stack + leading everywhere. */
export function ScriptText({
  children,
  size = 'base',
  className,
}: {
  children: ReactNode;
  size?: 'sm' | 'base' | 'lg' | 'xl';
  className?: string;
}) {
  const sizes = {
    sm: 'text-[15px]',
    base: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-[1.75rem] leading-snug sm:text-4xl',
  } as const;
  return <span className={cn('knn', sizes[size], className)} lang="kn">{children}</span>;
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card', className)} {...props} />;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-saffron-600">{eyebrow}</p>
        ) : null}
        <h2 className="text-xl font-bold text-ink-800 sm:text-2xl">{title}</h2>
        {description ? <p className="mt-1.5 text-sm text-ink-400">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
  tone?: 'default' | 'accent' | 'danger';
};

/** Round icon-only control with a real accessible name and a tooltip. */
export function IconButton({ label, active, tone = 'default', className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active ? true : undefined}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition',
        'hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40',
        tone === 'accent' && 'border-saffron-200 bg-saffron-50 text-saffron-700 hover:bg-saffron-100',
        tone === 'danger' && 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
        tone === 'default' && 'border-ink-100 bg-white text-ink-500 hover:bg-ivory-100 hover:text-ink-800',
        active && tone === 'default' && 'border-saffron-300 bg-saffron-50 text-saffron-700',
        className,
      )}
      {...props}
    />
  );
}

export function Chip({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'good' | 'warn' | 'info';
  className?: string;
}) {
  const tones = {
    neutral: 'border-ink-100 bg-ivory-50 text-ink-500',
    accent: 'border-saffron-200 bg-saffron-50 text-saffron-700',
    good: 'border-leaf-500/30 bg-leaf-100 text-leaf-600',
    warn: 'border-amber-300/60 bg-amber-50 text-amber-800',
    info: 'border-ink-100 bg-ink-50 text-ink-500',
  } as const;
  return <span className={cn('chip', tones[tone], className)}>{children}</span>;
}

/** Progress meter used for learning stats. `value` is 0-100. */
export function Meter({
  value,
  label,
  tone = 'accent',
  showValue = true,
}: {
  value: number;
  label: string;
  tone?: 'accent' | 'good' | 'ink';
  showValue?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const fills = {
    accent: 'bg-saffron-500',
    good: 'bg-leaf-500',
    ink: 'bg-ink-600',
  } as const;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-ink-400">
        <span>{label}</span>
        {showValue ? <span className="tabular-nums text-ink-500">{clamped}%</span> : null}
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-ivory-300"
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={cn('h-full rounded-full transition-[width] duration-500', fills[tone])} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      {icon ? <div className="text-3xl text-saffron-500" aria-hidden="true">{icon}</div> : null}
      <h3 className="text-base font-bold text-ink-700">{title}</h3>
      <p className="max-w-md text-sm text-ink-400">{description}</p>
      {action}
    </div>
  );
}

/** Polite live region used for playback / practice / recognition feedback. */
export function StatusLine({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'good' | 'warn' | 'error';
  children: ReactNode;
}) {
  const tones = {
    info: 'border-ink-100 bg-white text-ink-500',
    good: 'border-leaf-500/30 bg-leaf-100 text-leaf-600',
    warn: 'border-amber-300/60 bg-amber-50 text-amber-900',
    error: 'border-rose-200 bg-rose-50 text-rose-800',
  } as const;
  if (!children) return null;
  return (
    <p role="status" aria-live="polite" className={cn('rounded-xl border px-3 py-2 text-xs font-medium', tones[tone])}>
      {children}
    </p>
  );
}
