import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

const PlayerContext = createContext(null);

export function usePlayer() {
  return useContext(PlayerContext);
}

// coverUrl is empty on purpose: the vinyl shows its default label when there is no album art
const placeholder = {
  id: "none",
  title: "Title",
  artist: "Artist Name",
  album: "",
  coverUrl: "",
  audioUrl: "",
};

async function loadQueue() {
  const snap = await getDocs(query(collection(db, "tracks"), orderBy("createdAt", "asc")));
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  try {
    const settings = await getDoc(doc(db, "settings", "music"));
    const activeId = settings.exists() ? settings.data().activePlaylistId : null;
    if (activeId) {
      const pl = await getDoc(doc(db, "playlists", activeId));
      if (pl.exists()) {
        const byId = new Map(all.map((t) => [t.id, t]));
        const ordered = (pl.data().trackIds || []).map((id) => byId.get(id)).filter(Boolean);
        if (ordered.length) return ordered;
      }
    }
  } catch (err) {
    console.error("Playlist load error:", err);
  }
  return all; // no active playlist: play every song
}

export function PlayerProvider({ children }) {
  const { pathname } = useLocation();
  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const indexRef = useRef(0);
  const startedRef = useRef(false);
  const adminRef = useRef(false);
  const shuffleRef = useRef(false);
  const repeatRef = useRef(false);

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.6);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  adminRef.current = pathname.startsWith("/admin") || pathname === "/login";
  const track = queue[index] || placeholder;

  const select = useCallback((i, autoplay) => {
    const q = queueRef.current;
    if (!q.length) return;
    const n = ((i % q.length) + q.length) % q.length;
    indexRef.current = n;
    setIndex(n);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    const audio = audioRef.current;
    audio.src = q[n].audioUrl;
    if (autoplay) {
      startedRef.current = true;
      audio.play().catch(() => setNotice("Could not play this track."));
    }
  }, []);

  const goNext = useCallback(() => {
    const q = queueRef.current;
    if (!q.length) return;
    if (shuffleRef.current && q.length > 1) {
      let r = indexRef.current;
      while (r === indexRef.current) r = Math.floor(Math.random() * q.length);
      select(r, true);
    } else {
      select(indexRef.current + 1, true);
    }
  }, [select]);

  /* audio element */
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.volume = 0.6;
    audioRef.current = audio;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onPlay = () => { setPlaying(true); setNotice(""); };
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      if (repeatRef.current) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        goNext();
      }
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [goNext]);

  /* load songs from the database */
  useEffect(() => {
    let cancelled = false;
    loadQueue()
      .then((q) => {
        if (cancelled) return;
        queueRef.current = q;
        setQueue(q);
        select(0, false);
      })
      .catch((err) => console.error("Music load error:", err));
    return () => { cancelled = true; };
  }, [select]);

  /* start music on load, or on the first click if the browser blocks it */
  useEffect(() => {
    if (!queue.length) return;
    const audio = audioRef.current;

    if (!startedRef.current && !adminRef.current) {
      audio.play().then(() => { startedRef.current = true; }).catch(() => {});
    }

    const onFirstInteraction = (e) => {
      if (startedRef.current) {
        cleanup();
        return;
      }
      if (adminRef.current) return;
      if (e.target?.closest?.("[data-player-control]")) return; // the control handles it itself
      audio.play()
        .then(() => { startedRef.current = true; cleanup(); })
        .catch(() => {});
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
    window.addEventListener("pointerdown", onFirstInteraction);
    window.addEventListener("keydown", onFirstInteraction);
    return cleanup;
  }, [queue.length]);

  /* controls */
  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!queueRef.current.length) {
      setNotice("No music has been added yet.");
      return;
    }
    if (audio.paused) {
      startedRef.current = true;
      audio.play().catch(() => setNotice("Could not play this track."));
    } else {
      audio.pause();
    }
  }, []);

  const next = useCallback(() => goNext(), [goNext]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio.currentTime > 3) audio.currentTime = 0;
    else select(indexRef.current - 1, true);
  }, [select]);

  const seek = useCallback((percent) => {
    const audio = audioRef.current;
    const pct = Math.max(0, Math.min(100, percent));
    if (audio.duration) audio.currentTime = (audio.duration * pct) / 100;
  }, []);

  const choose = useCallback((i) => select(i, true), [select]);

  const setVolume = useCallback((v) => {
    audioRef.current.volume = v;
    setVolumeState(v);
  }, []);

  const toggleShuffle = useCallback(() => {
    shuffleRef.current = !shuffleRef.current;
    setShuffle(shuffleRef.current);
  }, []);

  const toggleRepeat = useCallback(() => {
    repeatRef.current = !repeatRef.current;
    setRepeat(repeatRef.current);
  }, []);

  const list = queue.map((t, i) => ({ ...t, index: i, active: i === index }));

  const value = {
    track, playing, progress, currentTime, duration, volume, shuffle, repeat, notice, list,
    toggle, next, prev, seek, choose, setVolume, toggleShuffle, toggleRepeat,
    modalOpen,
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
