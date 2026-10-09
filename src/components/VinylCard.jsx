import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

// each ring has a bright streak somewhere on it, so you can see the record turning
// inset: how far the ring sits outside the disc | from: where the streak starts | head: how bright it is
const rings = [
  { inset: "-14%", from: 0, head: 0.9 },
  { inset: "-8%", from: 120, head: 0.7 },
  { inset: "-3%", from: 240, head: 0.5 },
];

// cuts the gradient into a thin ring shape (2px wide)
const ringMask = "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))";

export default function VinylCard() {
  const {
    track, playing, progress, shuffle, repeat,
    toggle, next, prev, seek, toggleShuffle, toggleRepeat,
  } = usePlayer();

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * 100);
  };

  return (
    <div className="mx-auto w-full max-w-xs">
      {/* your original vinyl plate */}
      <div className="relative aspect-square rounded-full bg-[#141412] shadow-[0_0_80px_rgba(239,68,68,0.3)] border border-white/10 overflow-hidden">
        {/* glossy highlight */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none" />

        {/* spinning rings + album cover, centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[66%] aspect-square">
          <div
            className="vinyl-spin relative w-full h-full rounded-full"
            style={{ animationPlayState: playing ? "running" : "paused" }}
          >
            {rings.map((r) => (
              <div
                key={r.inset}
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: r.inset,
                  background: `conic-gradient(from ${r.from}deg, rgba(255,255,255,0.06) 0deg, rgba(255,255,255,0.12) 180deg, rgba(150,120,120,${r.head}) 350deg, rgba(255,255,255,0.06) 360deg)`,
                  WebkitMaskImage: ringMask,
                  maskImage: ringMask,
                }}
              />
            ))}
            <img
              src={track.coverUrl || "/profile.jpg"}
              alt={track.album || track.title}
              className="w-full h-full rounded-full object-cover border-4 border-[#141412]"
            />
          </div>
        </div>
      </div>

      {/* song title + artist */}
      <div className="mt-5">
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
