import { useEffect, useRef } from 'react';

/**
 * A fluid mechanics simulation rendered on canvas.
 * Creates flowing, colorful fluid dynamics that respond to mouse movement.
 */
export default function FluidBackground() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, px: window.innerWidth / 2, py: window.innerHeight / 2 });
  const velocityField = useRef([]);
  const densityField = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width, height, gridSize, cols, rows, raf;
    let last = performance.now();

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      gridSize = 8;
      cols = Math.ceil(width / gridSize);
      rows = Math.ceil(height / gridSize);

      // Initialize velocity and density fields
      velocityField.current = Array(cols * rows).fill(null).map(() => ({ vx: 0, vy: 0 }));
      densityField.current = Array(cols * rows).fill(0);
    }
    resize();
    window.addEventListener('resize', resize);

    function handleMove(e) {
      mouse.current.px = mouse.current.x;
      mouse.current.py = mouse.current.y;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    }
    window.addEventListener('mousemove', handleMove);

    function getIndex(x, y) {
      x = Math.max(0, Math.min(cols - 1, Math.floor(x)));
      y = Math.max(0, Math.min(rows - 1, Math.floor(y)));
      return y * cols + x;
    }

    function addVelocity(x, y, vx, vy) {
      const gridX = Math.floor(x / gridSize);
      const gridY = Math.floor(y / gridSize);
      if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
        // Add to neighboring cells too for smoother effect
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = gridX + dx;
            const ny = gridY + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
              const idx = getIndex(nx, ny);
              const dist = Math.sqrt(dx * dx + dy * dy) + 1;
              velocityField.current[idx].vx += vx / dist;
              velocityField.current[idx].vy += vy / dist;
            }
          }
        }
      }
    }

    function addDensity(x, y, amount) {
      const gridX = Math.floor(x / gridSize);
      const gridY = Math.floor(y / gridSize);
      if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
        // Add to neighboring cells too for smoother effect
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = gridX + dx;
            const ny = gridY + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
              const idx = getIndex(nx, ny);
              const dist = Math.sqrt(dx * dx + dy * dy) + 1;
              densityField.current[idx] = Math.min(1, densityField.current[idx] + amount / dist);
            }
          }
        }
      }
    }

    function diffuse(field, diffusion, dt) {
      const a = dt * diffusion * cols * rows;
      for (let iter = 0; iter < 4; iter++) {
        for (let y = 1; y < rows - 1; y++) {
          for (let x = 1; x < cols - 1; x++) {
            const idx = getIndex(x, y);
            const prev = field[idx];
            const neighbors = 
              field[getIndex(x - 1, y)] +
              field[getIndex(x + 1, y)] +
              field[getIndex(x, y - 1)] +
              field[getIndex(x, y + 1)];
            field[idx] = (prev + a * neighbors) / (1 + 4 * a);
          }
        }
      }
    }

    function advect(field, velocities, dt) {
      const newField = [...field];
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const idx = getIndex(x, y);
          const vel = velocities[idx];
          
          let prevX = x - dt * vel.vx * 20;
          let prevY = y - dt * vel.vy * 20;
          
          prevX = Math.max(0.5, Math.min(cols - 1.5, prevX));
          prevY = Math.max(0.5, Math.min(rows - 1.5, prevY));
          
          const x0 = Math.floor(prevX);
          const y0 = Math.floor(prevY);
          const x1 = x0 + 1;
          const y1 = y0 + 1;
          
          const sx = prevX - x0;
          const sy = prevY - y0;
          
          newField[idx] = 
            field[getIndex(x0, y0)] * (1 - sx) * (1 - sy) +
            field[getIndex(x1, y0)] * sx * (1 - sy) +
            field[getIndex(x0, y1)] * (1 - sx) * sy +
            field[getIndex(x1, y1)] * sx * sy;
        }
      }
      return newField;
    }

    function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!reduceMotion) {
        // Add velocity and density from mouse movement
        const dx = mouse.current.x - mouse.current.px;
        const dy = mouse.current.y - mouse.current.py;
        const speed = Math.sqrt(dx * dx + dy * dy);
        
        if (speed > 0.5) {
          addVelocity(mouse.current.x, mouse.current.y, dx * 2, dy * 2);
          addDensity(mouse.current.x, mouse.current.y, Math.min(speed * 0.05, 1));
        }

        // Update previous position
        mouse.current.px = mouse.current.x;
        mouse.current.py = mouse.current.y;

        // Damping velocity
        for (let i = 0; i < velocityField.current.length; i++) {
          const vel = velocityField.current[i];
          vel.vx *= 0.95;
          vel.vy *= 0.95;
        }

        // Diffuse and advect density
        diffuse(densityField.current, 0.001, dt);
        densityField.current = advect(densityField.current, velocityField.current, dt);

        // Fade density over time
        for (let i = 0; i < densityField.current.length; i++) {
          densityField.current[i] *= 0.98;
        }
      }

      // Render with blur effect
      ctx.clearRect(0, 0, width, height);
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = getIndex(x, y);
          const density = densityField.current[idx];
          
          if (density > 0.02) {
            const hue = (x / cols * 180 + y / rows * 180 + now * 0.01) % 360;
            const alpha = Math.min(density, 0.7);
            
            ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${alpha})`;
            ctx.fillRect(x * gridSize, y * gridSize, gridSize + 1, gridSize + 1);
          }
        }
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fluid-canvas" />;
}
