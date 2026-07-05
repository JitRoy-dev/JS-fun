import { useEffect, useRef } from 'react';

/**
 * A field of drifting, falling stars rendered on canvas.
 * Stars fall with a gentle sine-wave sway (like motes in still air),
 * and the cursor acts as a soft fluid disturbance: nearby stars get
 * pushed out of the way and settle back into their path afterwards.
 */
export default function FallingStars({ count = 160 }) {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width, height, stars, raf;
    let last = performance.now();

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function makeStar(randomY = true) {
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -10,
        r: Math.random() * 1.6 + 0.4,
        speed: (Math.random() * 34 + 16) * (reduceMotion ? 0.25 : 1),
        drift: Math.random() * 0.6 + 0.2,
        phase: Math.random() * Math.PI * 2,
        twinkle: Math.random() * 0.6 + 0.4,
      };
    }
    stars = Array.from({ length: count }, () => makeStar(true));

    function handleMove(e) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    }
    window.addEventListener('mousemove', handleMove);

    function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, width, height);

      for (const s of stars) {
        s.phase += dt * 1.2;
        s.y += s.speed * dt;
        s.x += Math.sin(s.phase) * s.drift;

        // Fluid-style disturbance: stars flow around the cursor
        // rather than through it, then relax back into their path.
        const dx = s.x - mouse.current.x;
        const dy = s.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = 130;
        if (dist < influence) {
          const force = (1 - dist / influence) * 60;
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          s.x += nx * force * dt;
          s.y += ny * force * dt;
        }

        if (s.y > height + 10) {
          s.y = -10;
          s.x = Math.random() * width;
        }
        if (s.x < -10) s.x = width + 10;
        if (s.x > width + 10) s.x = -10;

        const flicker = 0.55 + Math.sin(s.phase * 3) * 0.35 * s.twinkle;
        ctx.beginPath();
        ctx.fillStyle = `rgba(244, 241, 232, ${Math.max(flicker, 0.15)})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
    };
  }, [count]);

  return <canvas ref={canvasRef} className="star-canvas" />;
}
