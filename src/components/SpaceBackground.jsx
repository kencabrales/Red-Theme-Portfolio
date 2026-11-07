import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";

/* ---------- switches ---------- */
// "light"    = one slowly drifting star layer, nothing else (the lightest, the default)
// "balanced" = two drifting layers at different speeds, soft dust, and a few twinkling stars
// "rich"     = the same as balanced, with more stars
const QUALITY = "balanced";

const STAR_DIM = 0.5;   // 1 = full brightness, lower = dimmer stars (try 0.5 for very dim)
const NEBULA_DIM = 0.7;  // 1 = full brightness, lower = dimmer nebula

const ANIMATE_BACKGROUND = true; // false = the stars do not move or twinkle (parallax on scroll still works)
const PARALLAX = true;           // layers shift at different speeds as you scroll

const PRESETS = {
  light: { density: 0.45, flowLayers: 1, twinkle: false, dust: false },
  balanced: { density: 0.7, flowLayers: 2, twinkle: true, dust: true },
  rich: { density: 1, flowLayers: 2, twinkle: true, dust: true },
};
const Q = PRESETS[QUALITY] || PRESETS.light;

/* star colors per theme: [red, green, blue] */
const PALETTES = {
  blood: { star: [255, 232, 238], tint: [255, 120, 150] },
  white: { star: [244, 247, 255], tint: [205, 218, 255] },
  blue: { star: [228, 247, 255], tint: [110, 205, 255] },
};

/* Each drifting layer is a small tile of stars that repeats across the screen and slides by exactly one tile,
   so the loop has no seam.
   size: tile size in px | stars/dust: how many per tile | seconds: time for one full loop (bigger = slower)
   fx, fy: direction (0 = none, -1 = toward the top or left) | shift: parallax distance while scrolling */
const TILE_SLOW = { seed: 11, size: 640, stars: 150, dust: 0, r: [0.4, 0.9], alpha: [0.3, 0.65], seconds: 170, fx: 0, fy: -1, shift: 60 };
const TILE_FAST = { seed: 29, size: 520, stars: 50, dust: 14, r: [0.9, 2.1], alpha: [0.5, 1], seconds: 100, fx: -1, fy: -1, shift: 160 };
const TWINKLE_SHIFT = 110;

/* one soft nebula per theme (gradients only, it stays still) */
const NEBULA = {
  blood: [
    "radial-gradient(ellipse at 8% 20%, rgba(173,7,48,.40) 0%, transparent 42%)",
    "radial-gradient(ellipse at 88% 18%, rgba(101,5,48,.34) 0%, transparent 43%)",
    "radial-gradient(ellipse at 76% 76%, rgba(211,19,57,.31) 0%, transparent 45%)",
    "radial-gradient(ellipse at 17% 82%, rgba(105,7,47,.38) 0%, transparent 45%)",
    "radial-gradient(ellipse at 50% 45%, rgba(46,5,30,.15) 0%, transparent 60%)",
  ],
  white: [
    "radial-gradient(ellipse at 8% 20%, rgba(111,133,209,.36), transparent 42%)",
    "radial-gradient(ellipse at 88% 18%, rgba(204,211,255,.30), transparent 43%)",
    "radial-gradient(ellipse at 76% 76%, rgba(126,151,220,.30), transparent 45%)",
    "radial-gradient(ellipse at 17% 82%, rgba(170,183,232,.25), transparent 45%)",
    "radial-gradient(ellipse at 50% 45%, rgba(60,70,130,.18) 0%, transparent 60%)",
  ],
  blue: [
    "radial-gradient(ellipse at 8% 20%, rgba(13,89,204,.42), transparent 42%)",
    "radial-gradient(ellipse at 88% 18%, rgba(12,174,230,.35), transparent 43%)",
    "radial-gradient(ellipse at 76% 76%, rgba(40,83,208,.34), transparent 45%)",
    "radial-gradient(ellipse at 17% 82%, rgba(11,123,197,.30), transparent 45%)",
    "radial-gradient(ellipse at 50% 45%, rgba(10,50,130,.20) 0%, transparent 60%)",
  ],
};

const css = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// a small seeded random generator, so the star layout is the same in every theme
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* draws one tile of stars (and dust) and returns it as an image */
function makeTile(spec, palette, dpr) {
  const size = spec.size;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.round(size * dpr);
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const rng = seeded(spec.seed);
  const between = (min, max) => min + rng() * (max - min);

  // also draws at the wrapped position across the tile edges, so the tile repeats without a seam
  const wrapped = (x, y, reach, draw) => {
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const px = x + ox;
        const py = y + oy;
        if (px < -reach || px > size + reach || py < -reach || py > size + reach) continue;
        draw(px, py);
      }
    }
  };

  const starCount = Math.round(spec.stars * Q.density);
  for (let i = 0; i < starCount; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = between(spec.r[0], spec.r[1]);
    const a = between(spec.alpha[0], spec.alpha[1]) * STAR_DIM;
    const color = rng() < 0.35 ? palette.tint : palette.star;
    wrapped(x, y, r * 3.2, (px, py) => {
      if (r > 1.5) {
        ctx.fillStyle = css(color, a * 0.18);
        ctx.beginPath();
        ctx.arc(px, py, r * 3.2, 0, 6.283);
        ctx.fill();
      }
      ctx.fillStyle = css(color, a);
      ctx.beginPath();
      ctx.arc(px, py, r, 0, 6.283);
      ctx.fill();
    });
  }

  if (Q.dust && spec.dust) {
    const dustCount = Math.round(spec.dust * Q.density);
    for (let i = 0; i < dustCount; i++) {
      const x = rng() * size;
      const y = rng() * size;
      const r = between(3, 6);
      const a = between(0.1, 0.22) * STAR_DIM;
      const color = rng() < 0.4 ? palette.tint : palette.star;
      wrapped(x, y, r, (px, py) => {
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, r);
        gradient.addColorStop(0, css(color, a));
        gradient.addColorStop(1, css(color, 0));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, 6.283);
        ctx.fill();
      });
    }
  }

  return canvas.toDataURL("image/png");
}

function Stars({ theme }) {
  const cache = useRef({});
  const [tiles, setTiles] = useState({ slow: "", fast: "" });

  // the drifting star tiles: drawn once per theme, then reused
  useEffect(() => {
    if (!cache.current[theme]) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const palette = PALETTES[theme];
      cache.current[theme] = {
        slow: makeTile(TILE_SLOW, palette, dpr),
        fast: Q.flowLayers > 1 ? makeTile(TILE_FAST, palette, dpr) : "",
      };
    }
    setTiles(cache.current[theme]);
  }, [theme]);

  /* the twinkling bright stars (only in "balanced" and "rich"): one still layer whose brightness pulses */
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const twinkleRef = useRef(null);
  const twinkleStars = useRef([]);

  const paintTwinkle = (key) => {
    const canvas = twinkleRef.current;
    if (!canvas) return;
    const palette = PALETTES[key];
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of twinkleStars.current) {
      const color = s.tint ? palette.tint : palette.star;
      ctx.fillStyle = css(color, s.a * 0.2);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 3.4, 0, 6.283);
      ctx.fill();
      ctx.fillStyle = css(color, s.a);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fill();
    }
  };

  useEffect(() => {
    if (!Q.twinkle) return;
    let timer = 0;
    const build = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const canvas = twinkleRef.current;
      if (!canvas) return;
      canvas.width = w;
      canvas.height = h + TWINKLE_SHIFT;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h + TWINKLE_SHIFT}px`;
      const count = Math.max(8, Math.round(34 * ((w * h) / (1440 * 900)) * Q.density));
      twinkleStars.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * (h + TWINKLE_SHIFT),
        r: 1.1 + Math.random() * 1.3,
        a: (0.6 + Math.random() * 0.4) * STAR_DIM,
        tint: Math.random() < 0.4,
      }));
      paintTwinkle(themeRef.current);
    };
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(build, 250);
    };
    build();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (Q.twinkle) paintTwinkle(theme);
  }, [theme]);

  const flowLayer = (spec, url, key) => (
    <div key={key} className={`${PARALLAX ? "spx-par " : ""}absolute inset-0`} style={{ "--shift": `-${spec.shift}px` }}>
      <div
        className="spx-anim absolute left-0 top-0"
        style={{
          width: `calc(100% + ${spec.size}px)`,
          height: `calc(100% + ${spec.size + spec.shift}px)`,
          backgroundImage: url ? `url(${url})` : undefined,
          backgroundSize: `${spec.size}px ${spec.size}px`,
          backgroundRepeat: "repeat",
          "--fx": `${spec.fx * spec.size}px`,
          "--fy": `${spec.fy * spec.size}px`,
          animation: ANIMATE_BACKGROUND ? `spxFlow ${spec.seconds}s linear infinite` : undefined,
          willChange: ANIMATE_BACKGROUND ? "transform" : undefined,
        }}
      />
    </div>
  );

  return (
    <>
      {flowLayer(TILE_SLOW, tiles.slow, "slow")}
      {Q.flowLayers > 1 && flowLayer(TILE_FAST, tiles.fast, "fast")}
      {Q.twinkle && (
        <div className={`${PARALLAX ? "spx-par " : ""}absolute inset-0`} style={{ "--shift": `-${TWINKLE_SHIFT}px` }}>
          <canvas
            ref={twinkleRef}
            className="spx-anim absolute left-0 top-0"
            style={{
              animation: ANIMATE_BACKGROUND ? "spxTwinkle 7s ease-in-out infinite alternate" : undefined,
              willChange: ANIMATE_BACKGROUND ? "opacity" : undefined,
            }}
          />
        </div>
      )}
    </>
  );
}

export default function SpaceBackground() {
  const { theme } = useTheme();
  const nebula = useMemo(() => NEBULA[theme].join(", "), [theme]);

  return (
    <div aria-hidden className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <style>{`
        /* the star tiles slide by exactly one tile, so the loop is seamless */
        @keyframes spxFlow {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(var(--fx), var(--fy), 0); }
        }
        @keyframes spxTwinkle { from { opacity: .45; } to { opacity: 1; } }
        @keyframes spxParallax {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(0, var(--shift), 0); }
        }

        /* parallax: each layer follows the page scroll, done by the browser with no code running */
        @supports (animation-timeline: scroll()) {
          .spx-par {
            animation: spxParallax linear both;
            animation-timeline: scroll(root block);
            will-change: transform;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .spx-anim, .spx-par { animation: none !important; }
        }

        /* the stars pause while the screen is covered or the page is being scrolled */
        html.overlay-open .spx-anim,
        html.is-scrolling .spx-anim { animation-play-state: paused !important; }
      `}</style>

      <div className="spx-motion absolute inset-0">
        {/* one still, dimmed nebula, with a little parallax */}
        <div className={`${PARALLAX ? "spx-par " : ""}absolute inset-0`} style={{ "--shift": "-40px" }}>
          <div className="absolute" style={{ inset: "-8%", background: nebula, opacity: NEBULA_DIM }} />
        </div>

        <Stars theme={theme} />
      </div>

      {/* dark edges so text stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
}
