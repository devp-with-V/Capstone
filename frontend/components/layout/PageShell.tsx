import { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  /** Eyebrow label shown above the title, e.g. "Microservice #04 • Intelligence" */
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Material symbol name for the title icon badge */
  icon?: string;
  /** Right-side action (e.g. refresh button, CTA) */
  action?: ReactNode;
  /** Max width container, defaults to 7xl */
  wide?: boolean;
}

/**
 * Canonical Obsidian page wrapper: atmospheric glows + centered container
 * with standard top padding to clear the fixed AppHeader.
 */
export function PageShell({
  children,
  eyebrow,
  title,
  description,
  icon,
  action,
  wide,
}: PageShellProps) {
  return (
    <div className="w-full pt-32 pb-20 relative overflow-hidden">
      <div className="absolute -top-40 left-1/4 w-[420px] h-[420px] bg-secondary-container/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-60 right-10 w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[160px] pointer-events-none" />

      <div
        className={`w-full px-4 sm:px-8 lg:px-12 mx-auto flex flex-col gap-6 relative z-10 ${
          wide ? "max-w-7xl" : "max-w-5xl"
        }`}
      >
        {(eyebrow || title || description || action) && (
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2 max-w-3xl">
              {eyebrow && (
                <span className="font-code-mono text-xs text-primary uppercase tracking-widest font-semibold">
                  {eyebrow}
                </span>
              )}
              {title && (
                <div className="flex items-center gap-3">
                  {icon && (
                    <span className="material-symbols-outlined text-primary text-[28px]">
                      {icon}
                    </span>
                  )}
                  <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                    {title}
                  </h1>
                </div>
              )}
              {description && (
                <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </section>
        )}
        {children}
      </div>
    </div>
  );
}

interface ObsidianCardProps {
  children: ReactNode;
  className?: string;
}

/** Standard Obsidian content panel. */
export function ObsidianCard({ children, className = "" }: ObsidianCardProps) {
  return (
    <div
      className={`rounded-2xl bg-surface-container p-6 border border-white/[0.08] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}
