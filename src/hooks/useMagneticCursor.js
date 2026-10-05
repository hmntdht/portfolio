/**
 * useMagneticCursor — Custom magnetic cursor with glowing dot + trailing aura
 *
 * Creates a smooth, magnetic cursor effect:
 * - Glowing white cursor dot that follows mouse position
 * - Smooth trailing aura/ring that follows with interpolation
 * - Scales up when hovering over interactive elements
 * - Runs at 60fps via requestAnimationFrame
 */

import { useRef, useEffect, useCallback } from 'react';

const CURSOR_LERP = 0.18; // Smooth and natural
const AURA_LERP = 0.10;

export function useMagneticCursor() {
  const dotRef = useRef(null);
  const auraRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef({
    mouseX: 0,
    mouseY: 0,
    dotX: 0,
    dotY: 0,
    auraX: 0,
    auraY: 0,
    isHovering: false,
    isVisible: false,
  });

  const renderCursor = useCallback(() => {
    const pos = posRef.current;
    const dot = dotRef.current;
    const aura = auraRef.current;

    if (!dot || !aura) {
      animRef.current = requestAnimationFrame(renderCursor);
      return;
    }

    // Smooth interpolation
    pos.dotX += (pos.mouseX - pos.dotX) * CURSOR_LERP;
    pos.dotY += (pos.mouseY - pos.dotY) * CURSOR_LERP;
    pos.auraX += (pos.mouseX - pos.auraX) * AURA_LERP;
    pos.auraY += (pos.mouseY - pos.auraY) * AURA_LERP;

    // Apply transforms (GPU-accelerated)
    const dotScale = pos.isHovering ? 1.5 : 1;
    const auraScale = pos.isHovering ? 1.6 : 1;
    const dotOpacity = pos.isVisible ? 1 : 0;
    const auraOpacity = pos.isVisible ? (pos.isHovering ? 0.5 : 0.3) : 0;

    dot.style.transform = `translate3d(${pos.dotX}px, ${pos.dotY}px, 0) translate(-50%, -50%) scale(${dotScale})`;
    dot.style.opacity = dotOpacity;

    aura.style.transform = `translate3d(${pos.auraX}px, ${pos.auraY}px, 0) translate(-50%, -50%) scale(${auraScale})`;
    aura.style.opacity = auraOpacity;

    animRef.current = requestAnimationFrame(renderCursor);
  }, []);

  useEffect(() => {
    const pos = posRef.current;

    const onMouseMove = (e) => {
      pos.mouseX = e.clientX;
      pos.mouseY = e.clientY;
      if (!pos.isVisible) pos.isVisible = true;
    };

    const onMouseEnter = () => {
      pos.isVisible = true;
    };

    const onMouseLeave = () => {
      pos.isVisible = false;
    };

    // Detect interactive elements
    const onMouseOver = (e) => {
      const target = e.target;
      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[data-cursor-hover]');
      pos.isHovering = !!isInteractive;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseover', onMouseOver, { passive: true });

    // Start render loop
    animRef.current = requestAnimationFrame(renderCursor);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', onMouseOver);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [renderCursor]);

  return { dotRef, auraRef };
}
