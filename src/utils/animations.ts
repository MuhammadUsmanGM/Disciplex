/**
 * Disciplex Animation System
 * Using Moti for smooth, performant animations
 */

// Animation durations (ms)
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Animation easing
export const EASING = {
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  spring: {
    damping: 15,
    mass: 1,
    stiffness: 150,
  },
};

// Fade animations
export const FadeIn = {
  from: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    type: 'timing' as const,
    duration: ANIMATION_DURATIONS.normal,
  },
};

export const FadeOut = {
  from: { opacity: 1 },
  animate: { opacity: 0 },
  transition: {
    type: 'timing' as const,
    duration: ANIMATION_DURATIONS.normal,
  },
};

// Scale animations
export const ScaleIn = {
  from: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: {
    type: 'spring' as const,
    ...EASING.spring,
  },
};

export const ScaleOut = {
  from: { scale: 1, opacity: 1 },
  animate: { scale: 0.95, opacity: 0 },
  transition: {
    type: 'timing' as const,
    duration: ANIMATION_DURATIONS.fast,
  },
};

// Slide animations
export const SlideInFromBottom = {
  from: { translateY: 20, opacity: 0 },
  animate: { translateY: 0, opacity: 1 },
  transition: {
    type: 'spring' as const,
    ...EASING.spring,
  },
};

export const SlideInFromTop = {
  from: { translateY: -20, opacity: 0 },
  animate: { translateY: 0, opacity: 1 },
  transition: {
    type: 'spring' as const,
    ...EASING.spring,
  },
};

export const SlideInFromLeft = {
  from: { translateX: -20, opacity: 0 },
  animate: { translateX: 0, opacity: 1 },
  transition: {
    type: 'spring' as const,
    ...EASING.spring,
  },
};

export const SlideInFromRight = {
  from: { translateX: 20, opacity: 0 },
  animate: { translateX: 0, opacity: 1 },
  transition: {
    type: 'spring' as const,
    ...EASING.spring,
  },
};

// Button press animation
export const ButtonPress = {
  from: { scale: 1 },
  animate: { scale: 0.97 },
  transition: {
    type: 'timing' as const,
    duration: 100,
  },
};

export const ButtonRelease = {
  from: { scale: 0.97 },
  animate: { scale: 1 },
  transition: {
    type: 'spring' as const,
    ...EASING.spring,
  },
};

// Card hover/reveal animation
export const CardReveal = {
  from: { opacity: 0, translateY: 10 },
  animate: { opacity: 1, translateY: 0 },
  transition: {
    type: 'spring' as const,
    damping: 20,
    stiffness: 100,
  },
};

// Score counter animation
export const ScorePop = {
  from: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: {
    type: 'spring' as const,
    damping: 12,
    stiffness: 200,
  },
};

// Toggle switch animation
export const ToggleOn = {
  from: { translateX: 0 },
  animate: { translateX: 24 },
  transition: {
    type: 'spring' as const,
    damping: 20,
    stiffness: 300,
  },
};

export const ToggleOff = {
  from: { translateX: 24 },
  animate: { translateX: 0 },
  transition: {
    type: 'spring' as const,
    damping: 20,
    stiffness: 300,
  },
};

// Loading pulse animation
export const Pulse = {
  0: { opacity: 1 },
  0.5: { opacity: 0.5 },
  1: { opacity: 1 },
};

// Success checkmark animation
export const SuccessCheck = {
  from: { scale: 0, rotate: '-45deg' },
  animate: { scale: 1, rotate: '0deg' },
  transition: {
    type: 'spring' as const,
    damping: 10,
    stiffness: 200,
    delay: 100,
  },
};

// Streak fire animation
export const FireFlicker = {
  0: { scale: 1, rotate: '-5deg' },
  0.5: { scale: 1.1, rotate: '5deg' },
  1: { scale: 1, rotate: '-5deg' },
};

// Modal presentation animation
export const ModalSlideUp = {
  from: { translateY: 500, opacity: 0 },
  animate: { translateY: 0, opacity: 1 },
  transition: {
    type: 'spring' as const,
    damping: 25,
    stiffness: 200,
  },
};

export const ModalSlideDown = {
  from: { translateY: 0, opacity: 1 },
  animate: { translateY: 500, opacity: 0 },
  transition: {
    type: 'timing' as const,
    duration: ANIMATION_DURATIONS.normal,
  },
};

// Tab bar icon animation
export const TabIconActive = {
  from: { scale: 1, translateY: 0 },
  animate: { scale: 1.1, translateY: -4 },
  transition: {
    type: 'spring' as const,
    damping: 20,
    stiffness: 300,
  },
};

export const TabIconInactive = {
  from: { scale: 1.1, translateY: -4 },
  animate: { scale: 1, translateY: 0 },
  transition: {
    type: 'spring' as const,
    damping: 20,
    stiffness: 300,
  },
};

// Progress bar fill animation
export const ProgressFill = {
  from: { scaleX: 0 },
  animate: { scaleX: 1 },
  transition: {
    type: 'timing' as const,
    duration: ANIMATION_DURATIONS.slow,
    delay: 200,
  },
};

// List item stagger animation (for sequential reveals)
export const createStaggerAnimation = (index: number, delay = 50) => ({
  from: { opacity: 0, translateY: 20 },
  animate: { opacity: 1, translateY: 0 },
  transition: {
    type: 'spring' as const,
    damping: 20,
    stiffness: 100,
    delay: index * delay,
  },
});
