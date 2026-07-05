import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flashlight, FlashlightOff } from 'lucide-react';

export default function Torchlight({ active, onToggle }) {
  const overlayRef = useRef(null);
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const radius = useRef(190);
  const raf = useRef();

  useEffect(() => {
    function handleMove(e) {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    }
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  useEffect(() => {
    if (!active) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let t = 0;

    function loop() {
      t += 0.05;
      const flicker = reduceMotion ? 0 : Math.sin(t) * 4 + Math.sin(t * 5.3) * 2;
      const r = radius.current + flicker;
      const { x, y } = pos.current;
      if (overlayRef.current) {
        overlayRef.current.style.background = `radial-gradient(circle ${r}px at ${x}px ${y}px,
          rgba(255, 180, 84, 0.10) 0%,
          rgba(0, 0, 0, 0) 18%,
          rgba(5, 3, 1, 0.55) 55%,
          rgba(5, 7, 13, 0.97) 78%,
          #05070d 100%)`;
      }
      raf.current = requestAnimationFrame(loop);
    }
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  return (
    <>
      <button
        className="torch-toggle"
        onClick={onToggle}
        aria-pressed={active}
        aria-label={active ? 'Turn torch off' : 'Turn torch on'}
      >
        {active ? <FlashlightOff size={16} /> : <Flashlight size={16} />}
        <span>{active ? 'Torch off' : 'Torch on'}</span>
      </button>

      <AnimatePresence>
        {active && (
          <motion.div
            ref={overlayRef}
            className="torch-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
