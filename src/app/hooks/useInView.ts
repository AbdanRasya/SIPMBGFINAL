import { useEffect, useRef, useState } from "react";

/**
 * Intersection Observer hook for viewport-based animations.
 * Returns [ref, isInView] – attach ref to the element, isInView becomes true
 * when the element enters the viewport.
 */
export function useInView<T extends HTMLElement = HTMLElement>(
  options?: IntersectionObserverInit & { once?: boolean }
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);
  const { once = true, ...observerOptions } = options ?? {};

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.unobserve(element);
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold: 0.1, ...observerOptions }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once, observerOptions.threshold, observerOptions.rootMargin]);

  return [ref, isInView];
}
