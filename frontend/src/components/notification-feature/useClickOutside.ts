import { useEffect, type RefObject } from 'react';

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (ref.current && target && !ref.current.contains(target)) {
        onOutside();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [ref, onOutside, enabled]);
}
