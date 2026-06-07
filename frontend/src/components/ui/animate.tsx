'use client'

import React, { ReactNode, forwardRef } from 'react'
import { motion, HTMLMotionProps, Variant, Transition } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

type AnimateProps = {
  children: ReactNode;
  variant?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  triggerOnce?: boolean;
  viewport?: { once?: boolean; amount?: number | "some" | "all" };
  onAnimationComplete?: () => void;
} & Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit'>;

// Define animation variants with performance in mind
// Using transform/opacity for best GPU acceleration
type VariantWithTransition = {
  initial: Variant;
  animate: Variant;
  transition?: Transition;
};

const variants: Record<string, VariantWithTransition> = {
  'fade': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  },
  'slide-up': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: 0.5,
      opacity: { duration: 0.4 }, 
      y: { type: "spring", stiffness: 300, damping: 30 }
    }
  },
  'slide-down': {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: 0.5,
      opacity: { duration: 0.4 },
      y: { type: "spring", stiffness: 300, damping: 30 }
    }
  },
  'slide-left': {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { 
      duration: 0.5,
      opacity: { duration: 0.4 },
      x: { type: "spring", stiffness: 300, damping: 30 }
    }
  },
  'slide-right': {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { 
      duration: 0.5,
      opacity: { duration: 0.4 },
      x: { type: "spring", stiffness: 300, damping: 30 }
    }
  },
  'zoom': {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { 
      duration: 0.4,
      scale: { type: "spring", stiffness: 300, damping: 30 } 
    }
  },
  'none': {
    initial: { opacity: 1 },
    animate: { opacity: 1 }
  }
};

// Check for prefers-reduced-motion preference
const prefersReducedMotion = 
  typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

export const Animate = forwardRef<HTMLDivElement, AnimateProps>(
  ({ 
    children, 
    variant = 'fade', 
    delay = 0, 
    duration, 
    className,
    threshold = 0.1,
    rootMargin = '0px',
    once = true,
    triggerOnce,
    viewport,
    onAnimationComplete,
    ...props 
  }, forwardedRef) => {
    // Use intersection observer to trigger animations only when visible
    const [isInView, ref] = useIntersectionObserver<HTMLDivElement>({
      threshold,
      rootMargin,
      once: triggerOnce ?? once
    });

    // Handle reduced motion preference
    const effectiveVariant = prefersReducedMotion ? 'fade' : variant;
    
    // Get the selected variant
    const selectedVariant = variants[effectiveVariant] || variants.fade;
    
    // Apply custom duration if specified
    const customTransition = selectedVariant.transition ? {
      ...selectedVariant.transition,
      ...(duration ? { duration } : {})
    } : duration ? { duration } : undefined;

    return (
      <motion.div
        ref={node => {
          // Handle both intersection observer ref and forwarded ref
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
          
          // Set the intersection observer ref
          if (ref) {
            ref.current = node;
          }
        }}
        className={cn(className)}
        initial="initial"
        animate={isInView ? "animate" : "initial"}
        variants={{
          initial: selectedVariant.initial,
          animate: selectedVariant.animate
        }}
        transition={{
          ...(customTransition || {}),
          delay
        }}
        onAnimationComplete={onAnimationComplete}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Animate.displayName = 'Animate';

// Create a component for automatically staggering children animations
export const AnimateGroup = ({ 
  children, 
  staggerDelay = 0.1,
  containerVariant = 'none',
  childVariant = 'fade',
  className,
  childClassName,
  ...props 
}: { 
  children: ReactNode; 
  staggerDelay?: number;
  containerVariant?: AnimateProps['variant'];
  childVariant?: AnimateProps['variant'];
  className?: string;
  childClassName?: string;
} & Omit<AnimateProps, 'children' | 'variant'>) => {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <Animate variant={containerVariant} className={className} {...props}>
      {childrenArray.map((child, i) => (
        <Animate
          key={i}
          variant={childVariant}
          delay={i * staggerDelay}
          className={childClassName}
        >
          {child}
        </Animate>
      ))}
    </Animate>
  );
}; 