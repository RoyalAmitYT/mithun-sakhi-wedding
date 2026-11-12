'use client'; // Required if using Next.js App Router

import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  tilt: number;
  tiltSpeed: number;
  color: string;
  opacity: number;
}

interface GoldSparkle {
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

export const PetalCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Respect reduced motion
    if (typeof window === "undefined" || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let isDisposed = false;
    let cleanup: (() => void) | null = null;

    const startCanvas = () => {
      if (isDisposed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      let animationFrameId: number;
      const isMobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.2 : 1.5);

      let width = window.innerWidth;
      let height = window.innerHeight;

      const configureCanvas = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      };

      configureCanvas();

      let mouseX = width / 2;
      let targetWindX = 0;
      let windX = 0;

      const handleResize = () => {
        if (!canvas) return;
        configureCanvas();
      };

      const handleMouseMove = (e: MouseEvent) => {
        const delta = (e.clientX - mouseX) * 0.01;
        targetWindX = Math.max(-1.5, Math.min(1.5, delta));
        mouseX = e.clientX;
      };

      window.addEventListener('resize', handleResize, { passive: true });
      if (!isMobile) {
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
      }

      // Rose red, marigold orange, golden yellow petal colors
      const colors = ['#C43A48', '#E68A00', '#F2B705', '#8E162D', '#D97706'];

      // 1. Floral Petals (adaptive particle density)
      const petalCount = isMobile ? 7 : Math.min(24, Math.floor(window.innerWidth / 50));
      const petals: Petal[] = Array.from({ length: petalCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 7 + Math.random() * 8,
        speedY: 0.7 + Math.random() * 0.9,
        speedX: -0.5 + Math.random() * 1.0,
        rotation: Math.random() * 360,
        rotationSpeed: -1.2 + Math.random() * 2.4,
        tilt: Math.random() * Math.PI,
        tiltSpeed: 0.02 + Math.random() * 0.03,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.45 + Math.random() * 0.35,
      }));

      // 2. Floating Golden Dust Embers
      const sparkleCount = isMobile ? 8 : Math.min(26, Math.floor(window.innerWidth / 40));
      const sparkles: GoldSparkle[] = Array.from({ length: sparkleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.8 + Math.random() * 1.8,
        speedY: -(0.2 + Math.random() * 0.45),
        speedX: -0.2 + Math.random() * 0.4,
        opacity: 0.1,
        maxOpacity: 0.35 + Math.random() * 0.45,
        pulseSpeed: 0.02 + Math.random() * 0.04,
        pulsePhase: Math.random() * Math.PI * 2,
      }));

      let isVisible = !document.hidden;
      let isRunning = true;

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

        ctx.clearRect(0, 0, width, height);

        // Smooth dampening of mouse wind
        windX += (targetWindX - windX) * 0.05;
        targetWindX *= 0.95;

        // Draw Golden Sparkles
        for (let i = 0; i < sparkles.length; i++) {
          const s = sparkles[i];
          s.y += s.speedY;
          s.x += s.speedX + windX * 0.3;
          s.pulsePhase += s.pulseSpeed;
          s.opacity = (Math.sin(s.pulsePhase) + 1) * 0.5 * s.maxOpacity;

          if (s.y < -10) {
            s.y = height + 10;
            s.x = Math.random() * width;
          }
          if (s.x > width + 10) s.x = -10;
          if (s.x < -10) s.x = width + 10;

          // Outer halo
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 230, 190, ${s.opacity * 0.35})`;
          ctx.fill();

          // Central sparkle
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 238, 185, ${s.opacity})`;
          ctx.fill();
        }

        // Draw Floral Petals
        for (let i = 0; i < petals.length; i++) {
          const p = petals[i];
          p.y += p.speedY;
          p.tilt += p.tiltSpeed;
          p.x += Math.sin(p.y * 0.005) * 0.9 + p.speedX + windX;
          p.rotation += p.rotationSpeed;

          if (p.y > height + 25) {
            p.y = -25;
            p.x = Math.random() * width;
          }
          if (p.x > width + 25) p.x = -25;
          if (p.x < -25) p.x = width + 25;

          const tiltScale = Math.cos(p.tilt);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.scale(1, Math.max(0.2, Math.abs(tiltScale)));
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          // Curved petal geometry
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-p.size / 2, -p.size, -p.size, p.size / 2, 0, p.size);
          ctx.bezierCurveTo(p.size, p.size / 2, p.size / 2, -p.size, 0, 0);
          ctx.fill();

          // Center vein
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
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
        if (!isMobile) {
          window.removeEventListener('mousemove', handleMouseMove);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        cancelAnimationFrame(animationFrameId);
      };
    };

    // Defer canvas particle startup until main thread is idle (preserves LCP / TBT)
    const idleId = typeof window !== "undefined" && "requestIdleCallback" in window
      ? (window as unknown as { requestIdleCallback: (cb: () => void, opt: { timeout: number }) => number }).requestIdleCallback(startCanvas, { timeout: 2500 })
      : setTimeout(startCanvas, 1500);

    return () => {
      isDisposed = true;
      if (typeof window !== "undefined" && "cancelIdleCallback" in window && typeof idleId === "number") {
        (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId as NodeJS.Timeout);
      }
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-20 h-full w-full opacity-70 will-change-transform"
      style={{ transform: "translateZ(0)" }}
      aria-hidden="true"
    />
  );
};

export default PetalCanvas;
