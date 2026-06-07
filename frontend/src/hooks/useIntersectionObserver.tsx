'use client'

import { useState, useEffect, useRef, RefObject } from 'react'

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
}

export function useIntersectionObserver<T extends Element>(
  options: IntersectionObserverOptions = {}
): [boolean, RefObject<T | null>] {
  const { 
    root = null, 
    rootMargin = '0px', 
    threshold = 0.1,
    once = true 
  } = options;
  
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<T | null>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // Early return if already triggered and once is true
    if (isIntersecting && once) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);
        
        // Unobserve if once is true and element is intersecting
        if (isElementIntersecting && once && element) {
          observer.unobserve(element);
        }
      },
      { root, rootMargin, threshold }
    );
    
    observer.observe(element);
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [root, rootMargin, threshold, once, isIntersecting]);
  
  return [isIntersecting, elementRef];
} 