import { useState } from 'react';
import FallingStars from './components/FallingStars.jsx';
import FluidBackground from './components/FluidBackground.jsx';
import BigText from './components/BigText.jsx';
import Torchlight from './components/Torchlight.jsx';

export default function App() {
  const [torchOn, setTorchOn] = useState(false);

  return (
    <div className="app">
      <FluidBackground />
      <FallingStars count={180} />
      <div className="vignette" />

      <header className="hud">
        <span className="hud-label">Ashmit-GaY</span>
      </header>

      <main className="stage">
        <BigText />
      </main>

      <Torchlight active={torchOn} onToggle={() => setTorchOn((v) => !v)} />
    </div>
  );
}
