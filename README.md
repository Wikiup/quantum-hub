# 🎲 Quantum Hub

**The Ultimate Decision Randomizer**

A premium, mobile-first web application for all your randomization needs. Built with HTML5 Canvas, Tailwind CSS, and pure physics.

**URL:** [quantum-hub-fuk.pages.dev](https://quantum-hub-fuk.pages.dev)

## Features

*   **🎡 Spin Wheel:** Realistic friction, customizable slices, templates.
*   **🎲 Dice Roll:** 3D physics-based dice (D4, D6, D20, etc.).
*   **🪙 Coin Flip:** Satisfying 3D coin toss animation.
*   **🎟️ Raffle:** Bulk entry lists and winner selection.
*   **🏆 Ranking:** Tap-voting system.

## Tech Stack

*   **Frontend:** Vanilla JS (ES Modules)
*   **Styling:** Tailwind CSS (via CDN) + Custom CSS
*   **Icons:** Bootstrap Icons
*   **Hosting:** Cloudflare Pages

## Project Structure

```
/
├── index.html       # SPA Shell
├── css/
│   └── style.css    # Global Theme
├── js/
│   ├── app.js       # Router & State
│   ├── store.js     # LocalStorage Helper
│   └── modules/     # Individual Tools
│       ├── wheel.js
│       ├── dice.js
│       └── coin.js
└── assets/          # Images
```

## Development

1.  Run a local server: `python3 -m http.server 8080`
2.  Open `http://localhost:8080`

## License

MIT
