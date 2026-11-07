import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export const THEMES = ["blood", "white", "blue"];
const STORAGE_KEY = "site-theme";

const COVER_MS = 480; // how long the circle takes to cover the screen
const FADE_MS = 520;  // how long the cover takes to fade away

// per theme: glow color (red, green, blue) and the base color of the cover
const COVER = {
  blood: ["239,68,68", "#1a0508"],
  white: ["202,216,255", "#101428"],
  blue: ["53,165,255", "#061428"],
};

const ThemeContext = createContext({ theme: "blood", setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return THEMES.includes(saved) ? saved : "blood";
    } catch {
      return "blood";
    }
  });
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const busyRef = useRef(false);

  // the whole site reads the theme from this attribute on <html>
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  // setTheme("white", event): the cover grows from where the event happened
  const setTheme = useCallback((next, origin) => {
    if (!THEMES.includes(next) || next === themeRef.current) return;
    if (busyRef.current) return; // ignore clicks while a change is running

    const root = document.documentElement;
    const apply = () => {
      root.dataset.theme = next;
      setThemeState(next);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }

    busyRef.current = true;
    root.classList.add("overlay-open"); // pauses the heavy animations while the screen is covered

    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = Number.isFinite(origin?.clientX) ? origin.clientX : w * 0.72;
    const y = Number.isFinite(origin?.clientY) ? origin.clientY : h * 0.45;
    const radius = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
    const [glow, base] = COVER[next];

    const cover = document.createElement("div");
    Object.assign(cover.style, {
      position: "fixed",
      inset: "0",
      zIndex: "9999",
      pointerEvents: "none",
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(${glow}, 0.35), ${base} 65%)`,
      clipPath: `circle(0px at ${x}px ${y}px)`,
    });
    document.body.appendChild(cover);

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      cover.remove();
      root.classList.remove("overlay-open");
      busyRef.current = false;
    };
    // safety net, in case the browser never reports the animation as finished
    const safety = setTimeout(() => {
      apply();
      finish();
    }, COVER_MS + FADE_MS + 900);

    const grow = cover.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: COVER_MS, easing: "cubic-bezier(0.5, 0, 0.25, 1)", fill: "forwards" }
    );

    grow.onfinish = () => {
      apply(); // the screen is covered, so the switch is not visible
      // wait two frames so the new page has painted, then fade the cover away
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const out = cover.animate({ opacity: [1, 0] }, { duration: FADE_MS, easing: "ease-out", fill: "forwards" });
          out.onfinish = () => {
            clearTimeout(safety);
            finish();
          };
        })
      );
    };
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
