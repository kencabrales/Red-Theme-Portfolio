import { useEffect, useMemo, useRef, useState } from "react";
import "./AiSpace.css";

// orbit: 0 = outer ring, 1 = middle, 2 = inner | angle = where the icon starts (degrees)
const ITEMS = [
  { name: "CLAUDE", type: "claude", orbit: 0, angle: 205 },
  { name: "CODE", type: "code", orbit: 0, angle: 5 },
  { name: "SKILLS", type: "skills", orbit: 2, angle: 145 },
  { name: "CHATGPT", type: "chatgpt", orbit: 1, angle: 155 },
  { name: "GEMINI", type: "gemini", orbit: 2, angle: 315 },
  { name: "AI", type: "ai", orbit: 1, angle: 25 },
];

const DESIGN_W = 540; // the card's design size (px)
const DESIGN_H = 590;
const PARTICLE_COUNT = 90; // fewer = lighter on the computer
const ORBIT_SPEED = 0.1;   // radians per second
const TILT = (-17 * Math.PI) / 180;

function makeParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, id) => {
    const random = Math.random();
    const size = random < 0.15 ? 3 + Math.random() * 2 : 1 + Math.random() * 1.5;
    let kind = "";
    if (random < 0.2) kind = "aisp-glow";
    else if (random < 0.55) kind = "aisp-dust";
    return {
      id,
      kind,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        "--duration": `${4 + Math.random() * 9}s`,
        "--delay": `${-Math.random() * 12}s`,
      },
    };
  });
}

function Icon({ type }) {
  switch (type) {
    case "code":
      return <span className="aisp-code">&lt;/&gt;</span>;
    case "claude":
      return <span className="aisp-claude">✳</span>;
    case "skills":
      return <span className="aisp-skills">S</span>;
    case "ai":
      return <span className="aisp-ai">AI</span>;
    case "gemini":
      return (
        <svg viewBox="0 0 40 40" aria-label="Gemini">
          <defs>
            <linearGradient id="aisp-gemini" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b82ff" />
              <stop offset="50%" stopColor="#70bdff" />
              <stop offset="100%" stopColor="#e8c7ff" />
            </linearGradient>
          </defs>
          <path
            fill="url(#aisp-gemini)"
            d="M20 2C22 11 29 18 38 20 C29 22 22 29 20 38 C18 29 11 22 2 20 C11 18 18 11 20 2Z"
          />
        </svg>
      );
    case "chatgpt":
      return (
        <svg viewBox="0 0 40 40" aria-label="ChatGPT">
          <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7a8 8 0 0 1 13 6l-1 3" />
            <path d="M33 13a8 8 0 0 1 0 14l-3 1" />
            <path d="M30 28a8 8 0 0 1-13 6l-2-3" />
            <path d="M17 34A8 8 0 0 1 7 24l2-3" />
            <path d="M9 21A8 8 0 0 1 9 7l3-1" />
            <path d="M12 6a8 8 0 0 1 13 6" />
            <path d="m14 13 12 7-1 13" />
            <path d="m26 20 7-4" />
            <path d="m26 20-12 7" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}

function OrbitLines() {
  return (
    <svg className="aisp-lines" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
      <ellipse cx="300" cy="200" rx="265" ry="105" />
      <ellipse cx="300" cy="200" rx="230" ry="85" />
      <ellipse cx="300" cy="200" rx="195" ry="65" />
    </svg>
  );
}

// scale: 1 = full size, 0.75 = three quarters, 0.5 = half
export default function AiSpace({ scale = 0.75 }) {
  const particles = useMemo(makeParticles, []);
  const wrapRef = useRef(null);
  const rootRef = useRef(null);
  const itemsRef = useRef(null);
  const elRefs = useRef([]);
  const [fit, setFit] = useState(scale);

  // never bigger than "scale", and shrinks if the column is too narrow
  useEffect(() => {
    const parent = wrapRef.current?.parentElement;
    if (!parent) return;
    const update = () => {
      const style = getComputedStyle(parent);
      const available = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      setFit(available ? Math.min(scale, available / DESIGN_W) : scale);
    };
    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
  }, [scale]);

  useEffect(() => {
    const root = rootRef.current;
    const container = itemsRef.current;
    if (!root || !container) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cosT = Math.cos(TILT);
    const sinT = Math.sin(TILT);
    const zState = [];
    const startTime = performance.now();

    let width = container.clientWidth;
    let height = container.clientHeight;
    let raf = 0;
    let visible = true;

    const place = (now) => {
      if (!width || !height) return;
      const elapsed = (now - startTime) / 1000;
      const orbits = [
        { rx: (width * 265) / 600, ry: (height * 105) / 400 },
        { rx: (width * 230) / 600, ry: (height * 85) / 400 },
        { rx: (width * 195) / 600, ry: (height * 65) / 400 },
      ];

      ITEMS.forEach((item, i) => {
        const el = elRefs.current[i];
        if (!el) return;
        const orbit = orbits[item.orbit];
        const direction = item.orbit === 1 ? -1 : 1;
        const angle = (item.angle * Math.PI) / 180 + elapsed * ORBIT_SPEED * direction;

        // position on the ellipse, then tilted to match the orbit lines
        const x = orbit.rx * Math.cos(angle);
        const y = orbit.ry * Math.sin(angle);
        const rotatedX = x * cosT - y * sinT;
        const rotatedY = x * sinT + y * cosT;

        el.style.transform = `translate(-50%, -50%) translate(${rotatedX}px, ${rotatedY}px)`;

        // behind the moon on the upper half of the orbit, in front on the lower half
        const z = rotatedY < 0 ? "1" : "4";
        if (zState[i] !== z) {
          el.style.zIndex = z;
          zState[i] = z;
        }
      });
    };

    const loop = (now) => {
      if (!visible) {
        raf = 0;
        return;
      }
      if (!document.documentElement.classList.contains("overlay-open")) place(now);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!raf && !reduceMotion) raf = requestAnimationFrame(loop);
    };

    const resizeObserver = new ResizeObserver(() => {
      width = container.clientWidth;
      height = container.clientHeight;
      place(performance.now());
    });
    resizeObserver.observe(container);

    // stop moving things while the card is scrolled out of view
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      root.classList.toggle("aisp-paused", !visible);
      if (visible) start();
    });
    visibilityObserver.observe(root);

    place(performance.now());
    start();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, []);

  return (
    <div
      className="aisp-wrap"
      ref={wrapRef}
      style={{ width: DESIGN_W * fit, height: DESIGN_H * fit }}
    >
      <div className="aisp-card" ref={rootRef} style={{ transform: `scale(${fit})` }}>
        <header className="aisp-header">
          <span>AI SPACE</span>
          <span className="aisp-online"><i /> ONLINE</span>
        </header>

        <div className="aisp-stage">
          {/* floating particles */}
          <div className="aisp-particles" aria-hidden="true">
            {particles.map((p) => (
              <span key={p.id} className={`aisp-particle ${p.kind}`} style={p.style} />
            ))}
          </div>

          {/* blood moon */}
          <div className="aisp-moon" />

          {/* three tilted orbits, split into a back half and a front half */}
          <div className="aisp-layer aisp-back"><OrbitLines /></div>
          <div className="aisp-layer aisp-front"><OrbitLines /></div>

          {/* orbiting icons */}
          <div className="aisp-items" ref={itemsRef}>
            {ITEMS.map((item, i) => (
              <div
                key={item.name}
                className="aisp-item"
                ref={(el) => { elRefs.current[i] = el; }}
              >
                <Icon type={item.type} />
                <span className="aisp-name">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="aisp-footer">
          <div className="aisp-info">
            <span className="aisp-label">Modules</span>
            <strong>06</strong>
          </div>
          <div className="aisp-info">
            <span className="aisp-label">Event</span>
            <strong>Bloodmoon</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
