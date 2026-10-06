/**
 * useFrameRenderer — Canvas-based character frame renderer
 *
 * Preloads all 64 WebP frames + center.webp into an Image array.
 * Uses requestAnimationFrame to render a single crisp frame per cycle.
 * Calculates cursor angle via atan2, applies shortest-path circular
 * interpolation with lerpAngle, and maps to the nearest frame index.
 *
 * CRITICAL: Renders exactly ONE frame at 100% opacity. NO alpha blending,
 * NO crossfading, NO multiple frame layering.
 */

import { useRef, useEffect, useCallback } from 'react';

const TOTAL_FRAMES = 64;
const LERP_FACTOR = 0.15; // Lower factor = smoother frame traversal (higher perceived FPS) and more natural lag
const DEADZONE_RATIO = 0.12; // 12% of screen radius
const TWO_PI = Math.PI * 2;

/**
 * Frame-to-direction mapping offset.
 *
 * The video's rotation sequence maps as follows (from frame analysis):
 *   Frame  0: Forward/center
 *   Frame  8: Looking UP
 *   Frame 16: Looking RIGHT (viewer perspective)
 *   Frame 32: Looking DOWN
 *   Frame 48: Looking LEFT (viewer perspective)
 *
 * atan2 in screen coordinates (y-down):
 *   Angle 0     = RIGHT
 *   Angle π/2   = DOWN
 *   Angle π     = LEFT
 *   Angle -π/2  = UP
 *
 * We need: angle 0 (RIGHT) → frame 16
 *          angle π/2 (DOWN) → frame 32
 *          angle π (LEFT)   → frame 48
 *          angle 3π/2 (UP)  → frame 8 (= 64+8-64 = wrapped correctly with offset)
 *
 * Formula: frameIndex = ((normalizedAngle / 2π) * 64 + FRAME_OFFSET) % 64
 * where FRAME_OFFSET = 16
 */
const FRAME_OFFSET = 16;

/**
 * Shortest-path circular angular interpolation.
 * Ensures the angle always takes the shortest path around the circle.
 */
function lerpAngle(current, target, factor) {
  let diff = target - current;

  // Normalize to [-PI, PI] for shortest path
  while (diff > Math.PI) diff -= TWO_PI;
  while (diff < -Math.PI) diff += TWO_PI;

  return current + diff * factor;
}

/**
 * Normalize angle to [0, TWO_PI)
 */
function normalizeAngle(angle) {
  angle = angle % TWO_PI;
  if (angle < 0) angle += TWO_PI;
  return angle;
}

export function useFrameRenderer() {
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const centerFrameRef = useRef(null);
  const loadedRef = useRef(false);
  const animFrameRef = useRef(null);

  // Mutable state for the animation loop (no React re-renders)
  const stateRef = useRef({
    mouseX: 0,
    mouseY: 0,
    currentAngle: 0,
    inDeadzone: true,
    faceCenterX: 0,
    faceCenterY: 0,
    screenRadius: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    frameWidth: 0,
    frameHeight: 0,
    initialized: false,
  });

  /**
   * Preload all frames into Image objects.
   * Returns a promise that resolves when all images are loaded.
   */
  const preloadFrames = useCallback(() => {
    return new Promise((resolve) => {
      const images = [];

      // 1. Load center frame first and resolve promise immediately when done
      const centerImg = new Image();
      centerImg.onload = () => {
        centerFrameRef.current = centerImg;
        loadedRef.current = true;
        resolve();
      };
      centerImg.onerror = () => {
        loadedRef.current = true;
        resolve();
      };
      centerImg.src = `${import.meta.env.BASE_URL}frames/center.webp`;

      // 2. Start loading all other frames in the background
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        // The browser will load these asynchronously
        img.src = `${import.meta.env.BASE_URL}frames/frame-${String(i).padStart(3, '0')}.webp`;
        images.push(img);
      }
      framesRef.current = images;
    });
  }, []);

  /**
   * Calculate layout dimensions for object-fit: cover behavior.
   */
  const calculateLayout = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedRef.current || framesRef.current.length === 0) return;

    const state = stateRef.current;
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size to viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    canvas.width = vw * dpr;
    canvas.height = vh * dpr;
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;

    state.canvasWidth = vw * dpr;
    state.canvasHeight = vh * dpr;

    // Frame dimensions (from the already loaded center image)
    const img = centerFrameRef.current;
    state.frameWidth = img.naturalWidth;
    state.frameHeight = img.naturalHeight;

    // Character face center — approximately center-horizontal, upper-center vertical
    // Based on the video frames, the face is centered horizontally and in the upper 40%
    state.faceCenterX = vw * 0.5;
    state.faceCenterY = vh * 0.38;

    // Screen radius for deadzone calculation
    state.screenRadius = Math.sqrt(vw * vw + vh * vh) / 2;

    // Initialize mouse position at center if not yet set
    if (!state.initialized) {
      state.mouseX = vw / 2;
      state.mouseY = vh / 2;
      state.initialized = true;
    }
  }, []);

  /**
   * The core animation loop. Runs at 60 FPS via requestAnimationFrame.
   * Draws exactly ONE frame per cycle with no blending.
   */
  const renderLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedRef.current) {
      animFrameRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    const state = stateRef.current;

    // Calculate cursor angle relative to face center
    const dx = state.mouseX - state.faceCenterX;
    const dy = state.mouseY - state.faceCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const deadzoneRadius = state.screenRadius * DEADZONE_RATIO;

    // Check deadzone
    const isInDeadzone = distance < deadzoneRadius;
    state.inDeadzone = isInDeadzone;

    let frameToRender;

    if (isInDeadzone) {
      // Neutral eye-contact state
      frameToRender = centerFrameRef.current;
    } else {
      // Calculate target angle from cursor position
      // atan2 with y-down: 0=right, π/2=down, ±π=left, -π/2=up
      const targetAngle = normalizeAngle(Math.atan2(dy, dx));

      // Smooth interpolation with shortest-path circular lerp
      state.currentAngle = normalizeAngle(
        lerpAngle(state.currentAngle, targetAngle, LERP_FACTOR)
      );

      // Map angle to frame index with offset correction
      // The offset aligns atan2 directions with the video's rotation sequence
      let frameIndex = Math.round(
        (state.currentAngle / TWO_PI) * TOTAL_FRAMES + FRAME_OFFSET
      ) % TOTAL_FRAMES;
      if (frameIndex < 0) frameIndex += TOTAL_FRAMES;

      frameToRender = framesRef.current[frameIndex];
    }

    if (!frameToRender || !frameToRender.complete) {
      animFrameRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    // Clear and draw — single frame, 100% opacity, no blending
    const cw = state.canvasWidth;
    const ch = state.canvasHeight;
    const fw = state.frameWidth;
    const fh = state.frameHeight;

    // Calculate object-fit: cover dimensions
    const scale = Math.max(cw / fw, ch / fh);
    const drawW = fw * scale;
    const drawH = fh * scale;
    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    // Fill with exact background color to prevent any edge artifacts
    ctx.fillStyle = '#de2317';
    ctx.fillRect(0, 0, cw, ch);

    // Draw the single frame — exactly one, full opacity, no blending
    ctx.drawImage(frameToRender, drawX, drawY, drawW, drawH);

    animFrameRef.current = requestAnimationFrame(renderLoop);
  }, []);

  /**
   * Mouse move handler — updates state directly, no React re-renders
   */
  const handleMouseMove = useCallback((e) => {
    stateRef.current.mouseX = e.clientX;
    stateRef.current.mouseY = e.clientY;
  }, []);

  /**
   * Touch move handler for mobile
   */
  const handleTouchMove = useCallback((e) => {
    if (e.touches.length > 0) {
      stateRef.current.mouseX = e.touches[0].clientX;
      stateRef.current.mouseY = e.touches[0].clientY;
    }
  }, []);

  /**
   * Initialize the renderer
   */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await preloadFrames();
      if (!mounted) return;

      calculateLayout();

      // Start animation loop
      animFrameRef.current = requestAnimationFrame(renderLoop);

      // Event listeners
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('resize', calculateLayout, { passive: true });
    };

    init();

    return () => {
      mounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', calculateLayout);
    };
  }, [preloadFrames, calculateLayout, renderLoop, handleMouseMove, handleTouchMove]);

  return { canvasRef, loadedRef };
}
