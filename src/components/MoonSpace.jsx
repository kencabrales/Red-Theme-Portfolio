import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import "./MoonSpace.css";

/* ---------- the three moons ----------
   Use direct image links, or put files in /public and write "/moon-blue.jpg".
   If a picture can't load, the blood moon picture is used with a color effect instead. */
const BLOOD_IMAGE =
  "https://images.unsplash.com/photo-1758615498429-a57bd34ec0a7?q=80&w=1504&auto=format&fit=crop&ixlib=rb-4.1.0";
const WHITE_IMAGE =
  "https://images.unsplash.com/photo-1579021289055-fc2679991a35?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D";
const BLUE_IMAGE =
  "https://www.myku.co/cdn/shop/articles/MYKU_Blue_Moon_Tale_1200x800.jpg?v=1613962954";

const MOONS = {
  blood: {
    label: "BLOODMOON",
    name: "Bloodmoon",
    image: BLOOD_IMAGE,
    tint: "rgba(255, 35, 65, 0.12)",
    fallbackFilter: "saturate(1.08)",
    flash: "rgba(255, 35, 65, 0.48)",
  },
  white: {
    label: "WHITEMOON",
    name: "Whitemoon",
    image: WHITE_IMAGE,
    tint: "rgba(205, 215, 255, 0.15)",
    fallbackFilter: "grayscale(.82) brightness(1.2)",
    flash: "rgba(220, 230, 255, 0.52)",
  },
  blue: {
    label: "BLUEMOON",
    name: "Bluemoon",
    image: BLUE_IMAGE,
    tint: "rgba(25, 110, 255, 0.20)",
    fallbackFilter: "hue-rotate(155deg) saturate(.95) brightness(1.04)",
    flash: "rgba(55, 165, 255, 0.50)",
  },
};
const THEME_ORDER = ["blood", "white", "blue"];

const moonBackground = (url, tint) =>
  `radial-gradient(circle at 32% 25%, ${tint}, transparent 48%), url("${url}")`;

function preload(url) {
  return new Promise((resolve) => {
    const image = new Image();
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      resolve(ok);
    };
    const timeout = setTimeout(() => finish(false), 5000);
    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.src = url;
    if (image.complete && image.naturalWidth > 0) finish(true);
  });
}

/* ---------- orbiting icons ---------- */
// orbit: 0 = outer ring, 1 = middle, 2 = inner | angle = where the icon starts (degrees)
const ITEMS = [
  { name: "CLAUDE", type: "claude", orbit: 0, angle: 205 },
  { name: "CODE", type: "code", orbit: 0, angle: 5 },
  { name: "SKILLS", type: "skills", orbit: 2, angle: 145 },
  { name: "CHATGPT", type: "chatgpt", orbit: 1, angle: 155 },
  { name: "GEMINI", type: "gemini", orbit: 2, angle: 315 },
  { name: "AI", type: "ai", orbit: 1, angle: 25 },
];

const DESIGN_W = 540; // the scene's design size (px)
const DESIGN_H = 635;
const PARTICLE_COUNT = 24; // fewer = lighter on the computer
const ORBIT_SPEED = 0.1;   // radians per second
const TILT = (-17 * Math.PI) / 180;

function makeParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, id) => {
    const random = Math.random();
    const size = random < 0.15 ? 3 + Math.random() * 2 : 1 + Math.random() * 1.5;
    let kind = "";
    if (random < 0.2) kind = "msp-glow";
    else if (random < 0.55) kind = "msp-dust";
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
      return <span className="msp-code">&lt;/&gt;</span>;
    case "claude":
      return <span className="msp-claude">✳</span>;
    case "skills":
      return <span className="msp-skills">S</span>;
    case "ai":
      return <span className="msp-ai">AI</span>;
    case "gemini":
      return (
        <svg viewBox="0 0 40 40" aria-label="Gemini">
          <defs>
            <linearGradient id="msp-gemini" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b82ff" />
              <stop offset="50%" stopColor="#70bdff" />
              <stop offset="100%" stopColor="#e8c7ff" />
            </linearGradient>
          </defs>
          <path
            fill="url(#msp-gemini)"
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
    <svg className="msp-lines" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
      <ellipse cx="300" cy="200" rx="265" ry="105" />
      <ellipse cx="300" cy="200" rx="230" ry="85" />
      <ellipse cx="300" cy="200" rx="195" ry="65" />
    </svg>
  );
}

// scale: 1 = full size, 0.8 = four fifths, 0.5 = half
export default function MoonSpace({ scale = 0.8 }) {
  const { theme, setTheme } = useTheme();
  const particles = useMemo(makeParticles, []);

  const wrapRef = useRef(null);
  const rootRef = useRef(null);
  const itemsRef = useRef(null);
  const elRefs = useRef([]);
  const appliedRef = useRef(theme); // the moon currently shown
  const versionRef = useRef(0);
  const timerRef = useRef(0);

  const [fit, setFit] = useState(scale);
  const [surface, setSurface] = useState(() => ({
    url: MOONS[theme].image,
    filter: "none",
    tint: MOONS[theme].tint,
  }));
  const [overlay, setOverlay] = useState(null);
  const [changing, setChanging] = useState(false);
  const [flash, setFlash] = useState(MOONS[theme].flash);

  const index = THEME_ORDER.indexOf(theme);
  const go = (delta, e) => setTheme(THEME_ORDER[(index + delta + THEME_ORDER.length) % THEME_ORDER.length], e);

// load all three pictures in advance so switching feels instant
useEffect(() => {
  Object.values(MOONS).forEach((m) => {
    const img = new Image();
    img.src = m.image;
  });
}, []);

  /* never bigger than "scale", and shrinks if the column is too narrow */
  useEffect(() => {
    const parent = wrapRef.current?.parentElement;
    if (!parent) return;
    const update = () => {
      const style = getComputedStyle(parent);
      const available =
        parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      setFit(available > 0 ? Math.min(scale, available / DESIGN_W) : scale);
    };
    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
  }, [scale]);

  /* if the first moon picture can't load, fall back to the blood moon picture */
  useEffect(() => {
    let cancelled = false;
    const key = appliedRef.current;
    preload(MOONS[key].image).then((ok) => {
      if (cancelled || ok) return;
      setSurface({
        url: BLOOD_IMAGE,
        filter: key === "blood" ? "none" : MOONS[key].fallbackFilter,
        tint: MOONS[key].tint,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* the theme changed: fade and zoom in the new moon */
  useEffect(() => {
    if (appliedRef.current === theme) return;
    const version = ++versionRef.current;
    clearTimeout(timerRef.current);
    const moon = MOONS[theme];

    (async () => {
      let url = moon.image;
      let usingFallback = false;
      if (!(await preload(url))) {
        url = BLOOD_IMAGE;
        usingFallback = theme !== "blood";
      }
      if (version !== versionRef.current) return; // another moon was picked meanwhile

      const filter = usingFallback ? moon.fallbackFilter : "none";
      setFlash(moon.flash);
      setOverlay({ url, filter, tint: moon.tint, visible: false });
      setChanging(true);

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (version === versionRef.current) {
            setOverlay((o) => (o ? { ...o, visible: true } : o));
          }
        })
      );

      // when the fade is done, the new moon becomes the permanent one
      timerRef.current = setTimeout(() => {
        if (version !== versionRef.current) return;
        setSurface({ url, filter, tint: moon.tint });
        setOverlay(null);
        setChanging(false);
        appliedRef.current = theme;
      }, 1100);
    })();

    return () => {
      versionRef.current++;
      clearTimeout(timerRef.current);
    };
  }, [theme]);

  /* the icons orbiting the moon */
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

    // stop moving things while the scene is scrolled out of view
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      root.classList.toggle("msp-paused", !visible);
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
    <div className="msp-wrap" ref={wrapRef} style={{ width: DESIGN_W * fit, height: DESIGN_H * fit }}>
      <div
        className={`msp-card${changing ? " msp-changing" : ""}`}
        data-theme={theme}
        ref={rootRef}
        style={{ transform: `scale(${fit})` }}
      >
        <div className="msp-theme-hint" aria-label="Interactive Theme Changer">
          <span className="msp-theme-hint-label">Interactive Theme Changer</span>
          <span className="msp-theme-hint-arrow" aria-hidden="true">↓</span>
        </div>

        <header className="msp-header">
          <span>AI SPACE</span>
          <span className="msp-online"><i /> ONLINE</span>
        </header>

        {/* moon theme switcher */}
        <nav className="msp-carousel" aria-label="Choose a moon theme">
          <button className="msp-arrow" type="button" aria-label="Previous moon theme" onClick={(e) => go(-1, e)}>
            &#8249;
          </button>

          <div className="msp-viewport">
            <div className="msp-track">
              {THEME_ORDER.map((key, i) => {
                const relative = (i - index + THEME_ORDER.length) % THEME_ORDER.length;
                const position =
                  relative === 0 ? "active" : relative === 1 ? "position-right" : "position-left";
                return (
                  <button
                    key={key}
                    type="button"
                    className={`msp-slide ${position}`}
                    aria-pressed={relative === 0}
                    onClick={(e) => setTheme(key, e)}
                  >
                    {MOONS[key].label}
                  </button>
                );
              })}
            </div>
          </div>

          <button className="msp-arrow" type="button" aria-label="Next moon theme" onClick={(e) => go(1, e)}>
            &#8250;
          </button>
        </nav>

        <div className="msp-stage">
          <div className="msp-nebula" />

          <div className="msp-particles" aria-hidden="true">
            {particles.map((p) => (
              <span key={p.id} className={`msp-particle ${p.kind}`} style={p.style} />
            ))}
          </div>

          {/* the moon */}
          <div
            className="msp-moon"
            style={{ backgroundImage: moonBackground(surface.url, surface.tint), filter: surface.filter }}
          >
            {overlay && (
              <div
                className={`msp-moon-layer${overlay.visible ? " is-visible" : ""}`}
                style={{ backgroundImage: moonBackground(overlay.url, overlay.tint), filter: overlay.filter }}
              />
            )}
          </div>

          {/* three tilted orbits, split into a back half and a front half */}
          <div className="msp-layer msp-back"><OrbitLines /></div>
          <div className="msp-layer msp-front"><OrbitLines /></div>

          {/* orbiting icons */}
          <div className="msp-items" ref={itemsRef}>
            {ITEMS.map((item, i) => (
              <div
                key={item.name}
                className="msp-item"
                ref={(el) => {
                  elRefs.current[i] = el;
                }}
              >
                <Icon type={item.type} />
                <span className="msp-name">{item.name}</span>
              </div>
            ))}
          </div>

          {/* light burst when the theme changes */}
          <div
            className="msp-flash"
            style={{ background: `radial-gradient(circle at 50% 50%, ${flash}, transparent 70%)` }}
          />
        </div>

        <footer className="msp-footer">
          <div className="msp-info">
            <span className="msp-label">MODULES</span>
            <strong>06</strong>
          </div>
          <div className="msp-info">
            <span className="msp-label">EVENT</span>
            <strong>{MOONS[theme].name}</strong>
          </div>
        </footer>
      </div>
    </div>
  );
}
