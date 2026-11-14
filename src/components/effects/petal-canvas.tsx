'use client'; // Required if using Next.js App Router

import React, { useEffect, useRef } from 'react';

export interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  tilt: number;
  tiltSpeed: number;
  swayPhase: number;
  swaySpeed: number;
  color: string;
  opacity: number;
}

export interface GoldSparkle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
  maxOpacity: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export interface PetalCanvasProps {
  className?: string;
  maxPetals?: number;
  maxEmbers?: number;
}

/**
 * PetalCanvas — Ambient Atmospheric Particles & Floating Petals Engine
 *
 * Preserves the original Google AI Studio implementation:
 * - Original dual-layer particle architecture (curved heart-shaped petals + glowing embers).
 * - Original particle geometry with central vein details.
 * - Original mouse-driven wind dynamics with smooth dampening.
 * - Viewport lifecycle handling (idle deferral, visibility pausing, resize scaling).
 *
 * Enhancements:
 * - Romantic drift with organic sway phase for natural petal fluttering.
 * - Authentic royal wedding palette: deep burgundy, crimson rose, antique gold, luminous gold, and warm ivory.
 * - Warm antique-gold ember luminosity with soft ambient candlelight halo.
 * - Contextual atmospheric density: elevated presence in Hero, Ceremonies, and Invitation;
 *   delicately subdued over information-dense sections (Venues, Gallery, Wishes, RSVP, Contact)
 *   to ensure 100% crisp legibility without visual competition.
 * - Dynamic prefers-reduced-motion listener.
 * - 100% pointer-events-none: never obstructs interaction, scrolling, or buttons.
 */
export const PetalCanvas: React.FC<PetalCanvasProps> = ({
  className = '',
  maxPetals,
  maxEmbers,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Respect reduced motion on initial mount
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return;
    }

    let isDisposed = false;
    let cleanup: (() => void) | null = null;
    let isRunning = false;

    const startCanvas = () => {
      if (isDisposed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      let animationFrameId: number;
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.0 : isTablet ? 1.2 : 1.5);

      let curWidth = window.innerWidth;
      let curHeight = window.innerHeight;

      const configureCanvas = () => {
        curWidth = window.innerWidth;
        curHeight = window.innerHeight;
        canvas.width = Math.floor(curWidth * dpr);
        canvas.height = Math.floor(curHeight * dpr);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      };

      configureCanvas();

      let mouseX = curWidth / 2;
      let targetWindX = 0;
      let windX = 0;

      const handleResize = () => {
        if (!canvas) return;
        configureCanvas();
      };

      // Restrained, smooth mouse wind on desktop fine-pointer devices
      const handleMouseMove = (e: MouseEvent) => {
        const delta = (e.clientX - mouseX) * 0.005;
        targetWindX = Math.max(-0.9, Math.min(0.9, delta));
        mouseX = e.clientX;
      };

      window.addEventListener('resize', handleResize, { passive: true });
      if (!isMobile) {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
      }

      // Authentic royal wedding palette: sindoor burgundy, crimson rose, antique gold, luminous gold, warm champagne, soft rose ivory
      const colors = ['#8E1B29', '#A52232', '#B8975E', '#D4AF37', '#E8C882', '#FAF0F1'];

      // 1. Floral Petals (Tiered responsive particle density)
      const petalCount =
        maxPetals ??
        (isMobile ? 6 : isTablet ? 11 : Math.min(20, Math.floor(curWidth / 65)));

      const petals: Petal[] = Array.from({ length: petalCount }, () => ({
        x: Math.random() * curWidth,
        y: Math.random() * curHeight,
        size: isMobile ? 6 + Math.random() * 6 : 7 + Math.random() * 8,
        speedY: 0.5 + Math.random() * 0.65, // Gentle romantic drift
        speedX: -0.3 + Math.random() * 0.6,
        rotation: Math.random() * 360,
        rotationSpeed: -1.0 + Math.random() * 2.0,
        tilt: Math.random() * Math.PI,
        tiltSpeed: 0.015 + Math.random() * 0.025,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.012 + Math.random() * 0.018,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.42 + Math.random() * 0.34,
      }));

      // 2. Floating Golden Dust Embers
      const sparkleCount =
        maxEmbers ??
        (isMobile ? 8 : isTablet ? 14 : Math.min(24, Math.floor(curWidth / 55)));

      const sparkles: GoldSparkle[] = Array.from({ length: sparkleCount }, () => ({
        x: Math.random() * curWidth,
        y: Math.random() * curHeight,
        radius: isMobile ? 0.7 + Math.random() * 1.3 : 0.8 + Math.random() * 1.8,
        speedY: -(0.2 + Math.random() * 0.35),
        speedX: -0.15 + Math.random() * 0.3,
        opacity: 0.1,
        maxOpacity: 0.35 + Math.random() * 0.45,
        pulseSpeed: 0.018 + Math.random() * 0.035,
        pulsePhase: Math.random() * Math.PI * 2,
      }));

      let isVisible = !document.hidden;
      isRunning = true;

      // 3. Contextual Atmospheric Modulation
      let currentAtmosphere = 1.0;
      let targetAtmosphere = 1.0;

      const updateAtmosphereTarget = () => {
        if (typeof window === 'undefined') return;
        const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
        const vh = window.innerHeight;

        // A. Hero Zone: Full atmospheric immersion
        if (scrollY < vh * 0.85) {
          targetAtmosphere = 1.0;
          return;
        }

        // B. Ceremonies & Invitation Zone: Sacred storytelling presence
        const ceremoniesEl = document.getElementById('haldi');
        if (ceremoniesEl) {
          const rect = ceremoniesEl.getBoundingClientRect();
          if (rect.top < vh * 0.8 && rect.bottom > -vh * 3.5) {
            targetAtmosphere = 0.75;
            return;
          }
        }

        const invitationEl = document.getElementById('invitation');
        if (invitationEl) {
          const rect = invitationEl.getBoundingClientRect();
          if (rect.top < vh * 0.8 && rect.bottom > -vh * 0.5) {
            targetAtmosphere = 0.70;
            return;
          }
        }

        // C. Information & Interactive Sections (Venues, Gallery, Wishes, RSVP, Contact, Footer):
        // Quiet, unobtrusive background presence so text and form inputs remain 100% clean and legible
        targetAtmosphere = 0.32;
      };

      updateAtmosphereTarget();
      window.addEventListener('scroll', updateAtmosphereTarget, { passive: true });

      const handleVisibilityChange = () => {
        isVisible = !document.hidden;
        if (isVisible && !isRunning) {
          isRunning = true;
          animationFrameId = requestAnimationFrame(render);
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

      const render = () => {
        if (!isVisible || isDisposed) {
          isRunning = false;
          return;
        }

        ctx.clearRect(0, 0, curWidth, curHeight);

        // Smooth dampening of mouse wind
        windX += (targetWindX - windX) * 0.04;
        targetWindX *= 0.96;

        // Smooth gradual modulation of atmospheric density
        currentAtmosphere += (targetAtmosphere - currentAtmosphere) * 0.04;

        // Draw Golden Sparkles / Embers
        for (let i = 0; i < sparkles.length; i++) {
          const s = sparkles[i];
          s.y += s.speedY;
          s.x += s.speedX + windX * 0.25;
          s.pulsePhase += s.pulseSpeed;
          s.opacity = (Math.sin(s.pulsePhase) + 1) * 0.5 * s.maxOpacity * currentAtmosphere;

          if (s.y < -10) {
            s.y = curHeight + 10;
            s.x = Math.random() * curWidth;
          }
          if (s.x > curWidth + 10) s.x = -10;
          if (s.x < -10) s.x = curWidth + 10;

          // Soft outer ambient halo
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 220, 160, ${s.opacity * 0.28})`;
          ctx.fill();

          // Luminous antique-gold inner sparkle core
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 240, 195, ${s.opacity * 0.85})`;
          ctx.fill();
        }

        // Draw Floral Petals
        for (let i = 0; i < petals.length; i++) {
          const p = petals[i];
          p.y += p.speedY;
          p.tilt += p.tiltSpeed;
          p.swayPhase += p.swaySpeed;

          // Organic sway combined with speedX and smoothed wind
          const sway = Math.sin(p.swayPhase) * (0.5 + p.size * 0.04);
          p.x += sway + p.speedX + windX * 0.7;
          p.rotation += p.rotationSpeed;

          // Wrap around canvas edges
          if (p.y > curHeight + 25) {
            p.y = -25;
            p.x = Math.random() * curWidth;
          }
          if (p.x > curWidth + 25) p.x = -25;
          if (p.x < -25) p.x = curWidth + 25;

          const tiltScale = Math.cos(p.tilt);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.scale(1, Math.max(0.2, Math.abs(tiltScale)));
          ctx.globalAlpha = p.opacity * currentAtmosphere;
          ctx.fillStyle = p.color;

          // Original curved heart-shaped petal geometry strictly preserved
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-p.size / 2, -p.size, -p.size, p.size / 2, 0, p.size);
          ctx.bezierCurveTo(p.size, p.size / 2, p.size / 2, -p.size, 0, 0);
          ctx.fill();

          // Delicate center vein strictly preserved
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.2);
          ctx.lineTo(0, p.size * 0.7);
          ctx.stroke();

          ctx.restore();
        }

        animationFrameId = requestAnimationFrame(render);
      };

      animationFrameId = requestAnimationFrame(render);

      cleanup = () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', updateAtmosphereTarget);
        if (!isMobile) {
          window.removeEventListener('mousemove', handleMouseMove);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        cancelAnimationFrame(animationFrameId);
        if (canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        isRunning = false;
      };
    };

    // Dynamic preference change listener
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        if (cleanup) cleanup();
      } else if (!isRunning) {
        startCanvas();
      }
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    // Defer canvas particle startup until main thread is idle (preserves LCP / TBT)
    const idleId =
      typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? (
            window as unknown as {
              requestIdleCallback: (
                cb: () => void,
                opt: { timeout: number }
              ) => number;
            }
          ).requestIdleCallback(startCanvas, { timeout: 2500 })
        : setTimeout(startCanvas, 1500);

    return () => {
      isDisposed = true;
      mediaQuery.removeEventListener('change', handleMotionChange);
      if (
        typeof window !== 'undefined' &&
        'cancelIdleCallback' in window &&
        typeof idleId === 'number'
      ) {
        (
          window as unknown as { cancelIdleCallback: (id: number) => void }
        ).cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId as NodeJS.Timeout);
      }
      if (cleanup) cleanup();
    };
  }, [maxPetals, maxEmbers]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-20 h-full w-full opacity-70 will-change-transform ${className}`}
      style={{ transform: 'translateZ(0)' }}
      aria-hidden="true"
    />
  );
};

export default PetalCanvas;
