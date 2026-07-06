import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// ------------------------------------------------------------------
// ✏️ EDIT THE HEADLINE HERE. Use "\n" for a manual line break.
const HEADLINE = 'ASHMIT\nHIZRA';
// ------------------------------------------------------------------

export default function BigText({ text = HEADLINE }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 55, damping: 18, mass: 0.6 });
  const springY = useSpring(mouseY, { stiffness: 55, damping: 18, mass: 0.6 });

  const translateX = useTransform(springX, [-1, 1], [-36, 36]);
  const translateY = useTransform(springY, [-1, 1], [-22, 22]);
  const rotate = useTransform(springX, [-1, 1], [-3, 3]);
  const rotateX = useTransform(springY, [-1, 1], [4, -4]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    function handleMove(e) {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(nx);
      mouseY.set(ny);
    }
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  return (
    <div className="bigtext-wrap">
      <motion.h1
        className="bigtext"
        style={{ x: translateX, y: translateY, rotate, rotateX }}
      >
        {text.split('\n').map((line, i) => (
          <span className="bigtext-line" key={i}>
            {line}
          </span>
        ))}
      </motion.h1>
    </div>
  );
}
