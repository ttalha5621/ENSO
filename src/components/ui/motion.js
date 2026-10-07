/** Shared motion presets so every surface animates consistently. */
export const EASE = [0.16, 1, 0.3, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

export const stagger = (delay = 0.05, delayChildren = 0.05) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren } },
});

export const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(6px)' },
  enter: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: EASE } },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.2, ease: 'easeIn' } },
};

export const popover = {
  initial: { opacity: 0, scale: 0.96, y: -6 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.18, ease: EASE } },
  exit: { opacity: 0, scale: 0.97, y: -4, transition: { duration: 0.12 } },
};
