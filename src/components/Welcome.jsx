import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { Code2, User } from "lucide-react";
import VinylCard from "./VinylCard";

export default function Welcome() {
  const [visible, setVisible] = useState(() => {
  try {
    const forced = new URLSearchParams(window.location.search).has("welcome");
    return forced || !sessionStorage.getItem("welcomed");
  } catch {
    return true;
  }
});
  const [progress, setProgress] = useState(0);
  const ready = progress >= 100;

  useEffect(() => {
    if (!visible) return;
      document.body.style.overflow = "hidden";
      document.documentElement.classList.add("overlay-open");
    const timer = setInterval(() => setProgress((p) => Math.min(p + 2, 100)), 70);
    return () => {
      clearInterval(timer);
      document.body.style.overflow = "";
      document.documentElement.classList.remove("overlay-open");
    };
  }, [visible]);

  const enter = () => {
  try { sessionStorage.setItem("welcomed", "1"); } catch {}
  window.history.replaceState({}, "", window.location.pathname + window.location.hash);
  setVisible(false);
};

  const chip = "px-4 py-1.5 rounded-full border border-white/15 bg-white/5 text-[10px] tracking-[0.25em] font-semibold";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink overflow-y-auto"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(239,68,68,0.3),transparent_60%)]" />

          <div className="relative w-full max-w-6xl rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-8 md:p-12 overflow-hidden">
            <span className="absolute right-6 top-4 text-[9rem] font-extrabold text-white/[0.04] leading-none select-none pointer-events-none hidden lg:block">
              WELCOME
            </span>

            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              {/* left */}
              <div>
                <div className="flex flex-wrap gap-3">
                  <span className={`${chip} flex items-center gap-2`}>
                    <span className="w-2 h-2 rounded-full bg-brand animate-pulse" /> SYSTEM READY
                  </span>
                  <span className={chip}>PORTFOLIO 2026</span>
                  <span className={chip}>{ready ? "UI READY" : "UI LOADING"}</span>
                </div>

                <h1 className="mt-8 text-5xl md:text-6xl font-bold leading-[1.1]">
                  Welcome to my Portfolio Website
                </h1>
                <p className="mt-6 text-white/70 max-w-md">
                  Building modern, reliable, and fast digital experiences with a focus on clean UI and solid engineering.
                </p>

                <div className="mt-8 flex items-center gap-4">
                  <span className="text-[10px] tracking-[0.3em] text-white/50">LIVE STATUS</span>
                  <div className="flex-1 h-0.5 bg-white/10 rounded">
                    <div
                      className="h-full bg-brand rounded transition-[width] duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {[
                    { icon: Code2, label: "CODE" },
                    { icon: User, label: "PROFILE" },
                    { icon: FaGithub, label: "SOURCE" },
                  ].map(({ icon: Icon, label }) => (
                    <span key={label} className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-xs tracking-widest font-semibold">
                      <Icon size={15} className="text-brand-soft" /> {label}
                    </span>
                  ))}

                  <button
                    onClick={enter}
                    disabled={!ready}
                    className={`px-6 py-2.5 rounded-xl font-semibold transition ${
                      ready ? "bg-brand hover:bg-brand-soft" : "bg-white/10 text-white/40 cursor-not-allowed"
                    }`}
                  >
                    {ready ? "Enter →" : "Loading..."}
                  </button>
                </div>
              </div>

              {/* right: live vinyl player */}
              <VinylCard />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
