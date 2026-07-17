import { useEffect, useRef } from "react";

/**
 * Hook that detects clicks outside of the referenced element
 * and calls the handler. Used for closing dropdowns, modals, etc.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  active = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;

    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handler();
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handler, active]);

  return ref;
}
