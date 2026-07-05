# Starlight — interactive field note

A full-screen React + Framer Motion scene:

- **Big headline** that drifts and tilts with your mouse (parallax, spring physics).
- **Falling stars** on canvas that fall, sway, and flow around your cursor like a fluid current.
- **Torch mode** — click the toggle top-right to black out the screen except for a warm, flickering circle of light that follows your cursor.

## Run it

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Change the headline

Open `src/components/BigText.jsx` and edit the `HEADLINE` constant near the top:

```js
const HEADLINE = 'REACH FOR\nTHE DARK';
```

Use `\n` anywhere you want a manual line break. Everything else — the motion, the torch, the stars — keeps working automatically.

## Tweak the feel

- **Star count / speed**: `src/components/FallingStars.jsx` — `count` prop in `App.jsx`, plus `speed`/`drift` ranges inside the component.
- **Torch size / warmth**: `src/components/Torchlight.jsx` — `radius.current` and the colors inside the `radial-gradient`.
- **Palette / fonts**: CSS variables at the top of `src/index.css`.
