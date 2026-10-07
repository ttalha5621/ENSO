import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, animate, m, useInView } from 'framer-motion';
import { cx } from '../../utils/format.js';
import { fadeUp } from './motion.js';

export const GlassCard = forwardRef(function GlassCard({ as: Tag = 'div', className, strong, children, ...rest }, ref) {
  return (
    <Tag ref={ref} className={cx(strong ? 'glass-strong' : 'glass', 'rounded-2xl', className)} {...rest}>
      {children}
    </Tag>
  );
});

export function MotionCard({ className, children, ...rest }) {
  return (
    <m.div variants={fadeUp} className={cx('glass rounded-2xl', className)} {...rest}>
      {children}
    </m.div>
  );
}

/** Lightweight tooltip — CSS-positioned, appears on hover and keyboard focus. */
export function Tooltip({ label, side = 'bottom', children, className }) {
  const id = useId();
  const pos = {
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    left: 'end-full me-2 top-1/2 -translate-y-1/2',
    right: 'start-full ms-2 top-1/2 -translate-y-1/2',
  }[side];
  return (
    <span className={cx('group/tt relative inline-flex', className)} aria-describedby={id}>
      {children}
      <span
        role="tooltip"
        id={id}
        className={cx(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-strong opacity-0 shadow-lg glass-strong',
          'translate-y-1 transition duration-150 group-hover/tt:translate-y-0 group-hover/tt:opacity-100 group-focus-within/tt:translate-y-0 group-focus-within/tt:opacity-100',
          pos,
        )}
      >
        {label}
      </span>
    </span>
  );
}

export const IconButton = forwardRef(function IconButton({ label, icon: Icon, active, onClick, className, size = 'md', tooltipSide = 'bottom', badge, tone, ...rest }, ref) {
  const sizes = { sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-10 w-10' };
  const btn = (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      onClick={onClick}
      className={cx(
        'relative inline-flex shrink-0 items-center justify-center rounded-xl transition-all duration-200 disabled:pointer-events-none disabled:opacity-35',
        'hover:bg-[var(--glass-hover)] hover:text-strong active:scale-95',
        active ? (tone === 'ai' ? 'ai-gradient text-white shadow-lg shadow-violet-500/25' : 'bg-sky-500/15 text-sky-400 ring-1 ring-sky-400/30') : 'text-[var(--text)]',
        sizes[size],
        className,
      )}
      {...rest}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
      {badge ? (
        <span className="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-[var(--bg)]">
          {badge}
        </span>
      ) : null}
    </button>
  );
  return label ? <Tooltip label={label} side={tooltipSide}>{btn}</Tooltip> : btn;
});

export function Button({ variant = 'glass', size = 'md', icon: Icon, children, className, ...rest }) {
  const variants = {
    glass: 'bg-[var(--glass-soft)] hover:bg-[var(--glass-hover)] text-strong ring-1 ring-[var(--border)]',
    primary: 'bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/25 hover:brightness-110',
    ai: 'ai-gradient text-white shadow-lg shadow-violet-500/30 hover:brightness-110',
    ghost: 'hover:bg-[var(--glass-hover)] text-[var(--text)] hover:text-strong',
  };
  const sizes = { sm: 'h-8 px-3 text-xs gap-1.5', md: 'h-9 px-3.5 text-sm gap-2', lg: 'h-11 px-5 text-sm gap-2' };
  return (
    <button type="button" className={cx('inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50', variants[variant], sizes[size], className)} {...rest}>
      {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />}
      {children}
    </button>
  );
}

export function Switch({ checked, onChange, label, id }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200', checked ? 'bg-gradient-to-r from-sky-500 to-cyan-400' : 'bg-[var(--glass-hover)] ring-1 ring-[var(--border)]')}
    >
      <m.span layout transition={{ type: 'spring', stiffness: 600, damping: 32 }} className={cx('h-[18px] w-[18px] rounded-full bg-white shadow', checked ? 'ms-[23px]' : 'ms-[3px]')} />
    </button>
  );
}

export function Slider({ value, onChange, min = 0, max = 1, step = 0.05, label, color = '#38bdf8' }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--glass-hover)] accent-sky-400 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-sky-400"
      style={{ background: `linear-gradient(to right, ${color} ${pct}%, var(--glass-hover) ${pct}%)` }}
    />
  );
}

const DOT = { online: 'bg-emerald-400', ready: 'bg-emerald-400', offline: 'bg-red-500', error: 'bg-red-500', notConfigured: 'bg-slate-500', checking: 'bg-amber-400', loading: 'bg-amber-400', idle: 'bg-slate-500', 'no-token': 'bg-red-500' };
export function StatusDot({ state, pulse = true }) {
  const color = DOT[state] || 'bg-slate-500';
  const live = pulse && (state === 'online' || state === 'ready');
  return (
    <span className="relative inline-flex h-2 w-2">
      {live && <span className={cx('absolute inline-flex h-full w-full rounded-full animate-pulse-ring', color)} />}
      <span className={cx('relative inline-flex h-2 w-2 rounded-full', color)} />
    </span>
  );
}

export function Badge({ children, className, tone = 'default' }) {
  const tones = {
    default: 'bg-[var(--glass-soft)] text-[var(--text)] ring-[var(--border)]',
    sky: 'bg-sky-500/12 text-sky-400 ring-sky-400/25',
    ai: 'bg-violet-500/12 text-violet-300 ring-violet-400/25',
    warm: 'bg-orange-500/12 text-orange-400 ring-orange-400/25',
    cool: 'bg-blue-500/12 text-blue-400 ring-blue-400/25',
    green: 'bg-emerald-500/12 text-emerald-400 ring-emerald-400/25',
    red: 'bg-red-500/12 text-red-400 ring-red-400/25',
    amber: 'bg-amber-400/12 text-amber-400 ring-amber-400/25',
  };
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1', tones[tone], className)}>{children}</span>;
}

export function Skeleton({ className }) {
  return <div className={cx('skeleton rounded-lg', className)} aria-hidden />;
}

/** Count-up number that animates when it scrolls into view. */
export function AnimatedNumber({ value, decimals = 0, prefix = '', suffix = '', signed = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView || value == null || Number.isNaN(value)) return undefined;
    const controls = animate(0, value, { duration: 1.1, ease: [0.16, 1, 0.3, 1], onUpdate: setDisplay });
    return () => controls.stop();
  }, [value, inView]);
  if (value == null || Number.isNaN(value)) return <span ref={ref}>—</span>;
  const sign = signed && display > 0 ? '+' : display < 0 ? '−' : '';
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {sign}
      {Math.abs(display).toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function Segmented({ options, value, onChange, label, size = 'md' }) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl bg-[var(--glass-soft)] p-1 ring-1 ring-[var(--border)]">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cx('relative rounded-lg font-medium transition-colors', size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm', active ? 'text-strong' : 'text-muted hover:text-strong')}
          >
            {active && <m.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-lg bg-[var(--glass-hover)] ring-1 ring-[var(--border-strong)]" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Popover/menu anchored to a trigger; closes on outside click and Escape; restores focus. */
export function Popover({ trigger, children, align = 'end', width = 'w-72', className }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const triggerRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !wrap.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={wrap} className="relative">
      <div ref={triggerRef}>{trigger({ open, toggle: () => setOpen((v) => !v) })}</div>
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, scale: 0.97, y: -4, transition: { duration: 0.12 } }}
            style={{ transformOrigin: align === 'end' ? 'top right' : 'top left' }}
            className={cx('glass-strong absolute top-full z-50 mt-2 rounded-2xl p-2', align === 'end' ? 'end-0' : 'start-0', width, className)}
          >
            {children({ close: () => setOpen(false) })}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SectionTitle({ icon: Icon, title, action, subtitle, tone = 'sky' }) {
  const tones = { sky: 'from-sky-500/20 to-cyan-500/10 text-sky-400', ai: 'from-violet-500/25 to-fuchsia-500/10 text-violet-300', warm: 'from-orange-500/20 to-red-500/10 text-orange-400', green: 'from-emerald-500/20 to-teal-500/10 text-emerald-400' };
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-[var(--border)]', tones[tone])}>
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-display text-[15px] font-semibold text-strong">{title}</h3>
          {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, icon: Icon, actions }) {
  return (
    <m.header variants={fadeUp} className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-4">
        {Icon && (
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-500/25 via-cyan-500/10 to-violet-500/20 text-sky-300 ring-1 ring-[var(--border-strong)]">
            <Icon className="h-6 w-6" strokeWidth={1.6} />
          </span>
        )}
        <div>
          <h1 className="font-display text-2xl font-semibold text-strong md:text-[28px]">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </m.header>
  );
}
