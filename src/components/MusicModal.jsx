import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, X } from "lucide-react";
import VinylCard from "./VinylCard";
import { usePlayer } from "../context/PlayerContext";

export default function MusicModal() {
  const { modalOpen, closeModal, list, choose, volume, setVolume, notice } = usePlayer();

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, closeModal]);

  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.div
            className="relative w-full max-w-md max-h-[92vh] overflow-y-auto glass p-6"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              aria-label="Close"
              className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>

            <p className="text-[10px] tracking-[0.3em] text-white/50 text-center mb-4">NOW PLAYING</p>
            <VinylCard />

            {/* volume */}
            <div className="mt-5 flex items-center gap-3 text-white/60">
              <Volume2 size={16} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 accent-red-500"
                aria-label="Volume"
              />
            </div>
            {notice && <p className="mt-2 text-xs text-brand-soft">{notice}</p>}

            {/* choose song */}
            <p className="mt-6 mb-2 text-[10px] tracking-[0.3em] text-white/50">CHOOSE A SONG</p>
            <div className="space-y-1">
              {list.length === 0 && <p className="text-sm text-white/40">No songs yet.</p>}
              {list.map((item) => (
                <button
                  key={item.id}
                  onClick={() => choose(item.index)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition ${
                    item.active ? "bg-brand/20" : "hover:bg-white/5"
                  }`}
                >
                  <img
                    src={item.coverUrl || "/profile.jpg"}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover bg-white/5"
                  />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${item.active ? "text-brand-soft" : ""}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-white/50 truncate">{item.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
