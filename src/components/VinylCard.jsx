import { memo, useRef, useState } from "react";
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

// "cover" = the song's uploaded album cover fills the label (songs without a cover get the red label)
// "text"  = always the red label with the song artist and title
const LABEL_MODE = "cover";

// the tonearm: set to false to hide it
const SHOW_TONEARM = true;

// ---- tonearm settings (angles in degrees, 0 = resting off the record) ----
const PIVOT = { x: 93, y: 12 }; // where the arm pivots, in % of the turntable
const START_ANGLE = 14;         // needle at the outer groove (start of the song)
const END_ANGLE = 26;           // needle near the label (end of the song)
const ON_RECORD = 10;           // let go past this angle = needle on the record = play
const MIN_ANGLE = -6;
const MAX_ANGLE = 32;

// the grooves of the record
const recordBackground = [
  // a faint mark so the spin is visible on the plain grooves
  "conic-gradient(from 0deg, rgba(255,255,255,0.05) 0deg 8deg, transparent 8deg 200deg, rgba(255,255,255,0.03) 200deg 206deg, transparent 206deg 360deg)",
  // wider dark gaps between tracks
  "repeating-radial-gradient(circle at center, transparent 0 14px, rgba(0,0,0,0.55) 14px 16px)",
  // fine grooves
  "repeating-radial-gradient(circle at center, rgba(255,255,255,0.045) 0 1px, transparent 1px 3px)",
  // base shading (black all the way to the middle)
  "radial-gradient(circle at center, #0d0d10 0%, #0b0b0d 65%, #050506 100%)",
].join(", ");

// light reflections on the record (they stay still while it spins)
const sheen =
  "conic-gradient(from 20deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.16) 22deg, transparent 52deg, transparent 180deg, rgba(255,255,255,0.13) 205deg, transparent 240deg, transparent 360deg)";

// the curved (S-shaped) arm tube
const ARM_PATH = "M10 14 C10 34, 16.5 48, 16.5 62 S10 76, 10 83";

/* The record. It only redraws when the song or play state changes, not on every tick of the progress bar. */
const Record = memo(function Record({ playing, coverUrl, album, title, artist }) {
  const showCoverLabel = LABEL_MODE === "cover" && !!coverUrl;
  const spin = { animationPlayState: playing ? "running" : "paused", willChange: "transform" };

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[84%] aspect-square">
      {/* grooves (spin) */}
      <div
        className="vinyl-spin absolute inset-0 rounded-full"
        style={{
          ...spin,
          background: recordBackground,
          boxShadow: "inset 0 0 12px 3px rgba(0,0,0,0.8)",
        }}
      />

      {/* light reflections (stay still) */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: sheen }}
      />

      {/* center: spins with the grooves, drawn above the reflections so it stays pure black */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[46%] aspect-square pointer-events-none">
        <div className="vinyl-spin relative w-full h-full rounded-full" style={spin}>
          {/* black ring around the label */}
          <div className="absolute inset-0 rounded-full bg-black" />

          {/* label: album cover, or the red label */}
          <div className="absolute left-1/2 top-1/2 w-[82.6%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden bg-[#e11d2e] text-black">
            {showCoverLabel ? (
              <img src={coverUrl} alt={album || title} className="w-full h-full object-cover" />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-between py-[18%] px-[18%] text-center">
                <p className="text-[8px] font-bold uppercase leading-tight line-clamp-2">{artist}</p>
                <p className="text-[6px] uppercase leading-tight line-clamp-2">{title}</p>
              </div>
            )}
          </div>

          {/* small center hole */}
          <span className="absolute left-1/2 top-1/2 w-[13%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
        </div>
      </div>
    </div>
  );
});

/* The arm's artwork. It never changes, so it is drawn once. */
const ArmArt = memo(function ArmArt() {
  return (
    <>
      <defs>
        <linearGradient id="ta-metal" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#2b2b30" />
          <stop offset="0.3" stopColor="#8d8d96" />
          <stop offset="0.5" stopColor="#dcdce3" />
          <stop offset="0.7" stopColor="#7a7a83" />
          <stop offset="1" stopColor="#25252a" />
        </linearGradient>
        <linearGradient id="ta-dark" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#0b0b0e" />
          <stop offset="0.4" stopColor="#3c3c44" />
          <stop offset="1" stopColor="#0e0e12" />
        </linearGradient>
        <radialGradient id="ta-base" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#5d5d66" />
          <stop offset="0.6" stopColor="#2a2a2f" />
          <stop offset="1" stopColor="#101013" />
        </radialGradient>
      </defs>

      {/* soft shadow (plain shapes, no blur) */}
      <g fill="none" strokeLinecap="round" transform="translate(1.7 2.4)">
        <path d={ARM_PATH} stroke="rgba(0,0,0,0.10)" strokeWidth="4.2" />
        <path d={ARM_PATH} stroke="rgba(0,0,0,0.20)" strokeWidth="2.6" />
      </g>
      <circle cx="11.7" cy="16.4" r="7" fill="rgba(0,0,0,0.22)" />

      {/* counterweight */}
      <rect x="6.4" y="1.5" width="7.2" height="9.5" rx="1.2" fill="url(#ta-metal)" stroke="#16161a" strokeWidth="0.3" />
      <line x1="6.6" y1="4.2" x2="13.4" y2="4.2" stroke="#15151a" strokeWidth="0.35" />
      <line x1="6.6" y1="6.2" x2="13.4" y2="6.2" stroke="#15151a" strokeWidth="0.35" />
      <rect x="9.2" y="10.5" width="1.6" height="4" fill="#18181c" />

      {/* curved arm tube with a thin highlight */}
      <path d={ARM_PATH} fill="none" stroke="#0f0f12" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d={ARM_PATH}
        fill="none"
        stroke="rgba(190,190,205,0.45)"
        strokeWidth="0.5"
        strokeLinecap="round"
        transform="translate(-0.55 0)"
      />
      <circle cx="16.5" cy="62" r="1.5" fill="url(#ta-metal)" stroke="#16161a" strokeWidth="0.25" />

      {/* pivot base */}
      <circle cx="10" cy="14" r="7" fill="url(#ta-base)" stroke="#0b0b0d" strokeWidth="0.5" />
      <circle cx="10" cy="14" r="5.3" fill="none" stroke="#9a9aa3" strokeWidth="0.3" opacity="0.6" />
      <circle cx="10" cy="14" r="3.2" fill="url(#ta-metal)" stroke="#16161a" strokeWidth="0.3" />
      <circle cx="10" cy="14" r="1" fill="#15151a" />

      {/* headshell, cartridge and stylus (angled slightly toward the record) */}
      <g transform="rotate(6 10 83)">
        <path d="M8.2 82.5h3.6l0.9 11.5h-5.4z" fill="url(#ta-dark)" stroke="#8a8a93" strokeWidth="0.3" />
        <path d="M12 87q3.2 0.5 3.8 3.4" fill="none" stroke="#a5a5ae" strokeWidth="0.5" strokeLinecap="round" />
        <rect x="8.5" y="93.5" width="3" height="4.5" rx="0.6" fill="#18181b" stroke="#5b5b63" strokeWidth="0.3" />
        <line x1="10" y1="98" x2="10" y2="99.4" stroke="#ececf1" strokeWidth="0.5" strokeLinecap="round" />
      </g>
    </>
  );
});

function Tonearm({ angle, dragging, handlers }) {
  return (
    <svg
      viewBox="0 0 20 100"
      className="absolute"
      style={{
        left: "85%",
        top: "0.8%",
        width: "16%",
        height: "80%",
        transformOrigin: "50% 14%",
        transform: `rotate(${angle}deg)`,
        transition: dragging ? "none" : "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "transform",
        pointerEvents: "none",
        touchAction: "none",
      }}
    >
      <ArmArt />

      {/* invisible grab area: click it to play or pause, drag it to move the needle */}
      <g
        {...handlers}
        data-player-control
        role="button"
        tabIndex={0}
        aria-label="Tonearm. Click to play or pause, drag to move the needle."
        style={{ cursor: dragging ? "grabbing" : "grab", outline: "none" }}
      >
        <title>Click to play or pause. Drag to move the needle.</title>
        <path d={ARM_PATH} fill="none" stroke="transparent" strokeWidth="7" strokeLinecap="round" pointerEvents="stroke" />
        <rect x="4" y="80" width="12" height="21" fill="transparent" pointerEvents="all" transform="rotate(6 10 83)" />
      </g>
    </svg>
  );
}

export default function VinylCard() {
  const {
    track, playing, progress, shuffle, repeat,
    toggle, next, prev, seek, toggleShuffle, toggleRepeat,
  } = usePlayer();

  const turntableRef = useRef(null);
  const dragRef = useRef({ active: false, moved: false, angle: 0, frame: 0, startX: 0, startY: 0 });
  const [dragAngle, setDragAngle] = useState(null);

  // the needle starts near the edge of the record and moves inward as the song plays
  // (rounded so the arm only moves when it has really moved)
  const playAngle = START_ANGLE + (progress / 100) * (END_ANGLE - START_ANGLE);
  const restingAngle = playing ? Math.round(playAngle * 10) / 10 : 0;
  const armAngle = dragAngle ?? restingAngle;

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * 100);
  };

  /* ---------- tonearm: click and drag ---------- */
  const angleFromPointer = (e) => {
    const rect = turntableRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const deg = (Math.atan2(PIVOT.x - px, py - PIVOT.y) * 180) / Math.PI;
    return Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, deg));
  };

  const onArmDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true, moved: false, angle: armAngle, frame: 0,
      startX: e.clientX, startY: e.clientY,
    };
  };

  const onArmMove = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 4) return;
    d.moved = true;
    d.angle = angleFromPointer(e);
    if (!d.frame) {
      d.frame = requestAnimationFrame(() => {
        d.frame = 0;
        setDragAngle(dragRef.current.angle);
      });
    }
  };

  const onArmUp = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    cancelAnimationFrame(d.frame);
    d.frame = 0;
    e.currentTarget.releasePointerCapture?.(e.pointerId);

    if (!d.moved) {
      toggle(); // a simple click
      setDragAngle(null);
    } else if (d.angle > ON_RECORD) {
      // needle dropped on the record: jump to that spot in the song and play
      const pct = ((d.angle - START_ANGLE) / (END_ANGLE - START_ANGLE)) * 100;
      seek(Math.max(0, Math.min(100, pct)));
      if (!playing) toggle();
      setTimeout(() => setDragAngle(null), 350);
    } else {
      // needle lifted off the record: pause
      if (playing) toggle();
      setDragAngle(null);
    }
  };

  const onArmCancel = () => {
    dragRef.current.active = false;
    cancelAnimationFrame(dragRef.current.frame);
    setDragAngle(null);
  };

  const onArmKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  const armHandlers = {
    onPointerDown: onArmDown,
    onPointerMove: onArmMove,
    onPointerUp: onArmUp,
    onPointerCancel: onArmCancel,
    onKeyDown: onArmKey,
  };

  return (
    <div className="mx-auto w-full max-w-xs">
      {/* turntable */}
      <div className="relative aspect-square" ref={turntableRef}>
        {/* platter */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] aspect-square rounded-full bg-[#0e0e10] border border-white/10 shadow-[0_0_60px_rgba(239,68,68,0.3),0_12px_40px_rgba(0,0,0,0.7)]" />

        <Record
          playing={playing}
          coverUrl={track.coverUrl}
          album={track.album}
          title={track.title}
          artist={track.artist}
        />

        {SHOW_TONEARM && <Tonearm angle={armAngle} dragging={dragAngle !== null} handlers={armHandlers} />}
      </div>

      {/* song title + artist */}
      <div className="mt-4">
        <p className="text-2xl font-semibold leading-tight truncate" title={track.title}>
          {track.title}
        </p>
        <p className="mt-0.5 text-sm text-white/70 truncate" title={track.artist}>
          {track.artist}
        </p>
      </div>

      {/* progress bar with knob */}
      <div data-player-control className="relative mt-3 py-2 cursor-pointer" onClick={handleSeek}>
        <div className="h-[3px] rounded bg-white/30">
          <div className="h-full rounded bg-white" style={{ width: `${progress}%` }} />
        </div>
        <span
          className="absolute top-1/2 w-3.5 h-3.5 rounded-full bg-white -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* controls */}
      <div data-player-control className="mt-4 flex items-center justify-between px-1 text-white">
        <button onClick={toggleShuffle} aria-label="Shuffle" className={shuffle ? "text-brand-soft" : ""}>
          <Shuffle size={22} strokeWidth={2.5} />
        </button>
        <button onClick={prev} aria-label="Previous" className="hover:scale-110 transition">
          <SkipBack size={26} fill="currentColor" />
        </button>
        <button
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="w-14 h-14 rounded-full bg-white text-[#1a0508] flex items-center justify-center hover:scale-105 transition"
        >
          {playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
        <button onClick={next} aria-label="Next" className="hover:scale-110 transition">
          <SkipForward size={26} fill="currentColor" />
        </button>
        <button onClick={toggleRepeat} aria-label="Repeat" className={repeat ? "text-brand-soft" : ""}>
          <Repeat size={22} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
