import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  addDoc, arrayRemove, collection, deleteDoc, doc, getDoc, getDocs,
  orderBy, query, serverTimestamp, setDoc, updateDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { ArrowDown, ArrowUp, LogOut, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { auth, db } from "../firebase";
import { uploadImage } from "../utils/uploadImage";
import { uploadAudio } from "../utils/uploadAudio";

const swalTheme = { background: "#1a0508", color: "#fff", confirmButtonColor: "#ef4444" };
const emptyTrack = { title: "", artist: "", album: "", audioUrl: "", coverUrl: "" };
const emptyPlaylist = { name: "", trackIds: [] };
const inputClass =
  "w-full glass px-4 py-3 bg-white/5 outline-none focus:border-brand transition placeholder:text-white/40";

export default function AdminMusic() {
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [tForm, setTForm] = useState(emptyTrack);
  const [tEditing, setTEditing] = useState(null);
  const [tSaving, setTSaving] = useState(false);
  const [audioPct, setAudioPct] = useState(null); // null = not uploading
  const [coverUploading, setCoverUploading] = useState(false);

  const [pForm, setPForm] = useState(emptyPlaylist);
  const [pEditing, setPEditing] = useState(null);
  const [pSaving, setPSaving] = useState(false);

  const trackById = new Map(tracks.map((t) => [t.id, t]));

  const load = async () => {
    const [t, p, s] = await Promise.all([
      getDocs(query(collection(db, "tracks"), orderBy("createdAt", "asc"))),
      getDocs(query(collection(db, "playlists"), orderBy("createdAt", "desc"))),
      getDoc(doc(db, "settings", "music")),
    ]);
    setTracks(t.docs.map((d) => ({ id: d.id, ...d.data() })));
    setPlaylists(p.docs.map((d) => ({ id: d.id, ...d.data() })));
    setActiveId(s.exists() ? s.data().activePlaylistId || null : null);
  };

  useEffect(() => {
    load().catch((err) =>
      Swal.fire({ icon: "error", title: "Could not load music", text: err.message, ...swalTheme })
    );
  }, []);

  const fail = (title, err) => Swal.fire({ icon: "error", title, text: err.message, ...swalTheme });

  /* ---------------- songs ---------------- */
  const tChange = (e) => setTForm({ ...tForm, [e.target.name]: e.target.value });
  const resetTrack = () => { setTForm(emptyTrack); setTEditing(null); };

  const onAudioFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioPct(0);
    try {
      const url = await uploadAudio(file, setAudioPct);
      setTForm((f) => ({ ...f, audioUrl: url, title: f.title || file.name.replace(/\.[^.]+$/, "") }));
    } catch (err) {
      fail("Audio upload failed", err);
    } finally {
      setAudioPct(null);
      e.target.value = "";
    }
  };

  const onCoverFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const url = await uploadImage(file);
      setTForm((f) => ({ ...f, coverUrl: url }));
    } catch (err) {
      fail("Cover upload failed", err);
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  };

  const saveTrack = async (e) => {
    e.preventDefault();
    if (!tForm.audioUrl) {
      Swal.fire({ icon: "warning", title: "Upload an audio file first", ...swalTheme });
      return;
    }
    setTSaving(true);
    try {
      const data = {
        title: tForm.title.trim(),
        artist: tForm.artist.trim(),
        album: tForm.album.trim(),
        audioUrl: tForm.audioUrl.trim(),
        coverUrl: tForm.coverUrl.trim(),
      };
      if (tEditing) await updateDoc(doc(db, "tracks", tEditing), data);
      else await addDoc(collection(db, "tracks"), { ...data, createdAt: serverTimestamp() });
      await Swal.fire({ icon: "success", title: tEditing ? "Updated!" : "Song added!", timer: 1300, showConfirmButton: false, ...swalTheme });
      resetTrack();
      load();
    } catch (err) {
      fail("Could not save", err);
    } finally {
      setTSaving(false);
    }
  };

  const editTrack = (t) => {
    setTEditing(t.id);
    setTForm({
      title: t.title || "", artist: t.artist || "", album: t.album || "",
      audioUrl: t.audioUrl || "", coverUrl: t.coverUrl || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteTrack = async (t) => {
    const res = await Swal.fire({
      icon: "warning", title: "Delete this song?", text: t.title,
      showCancelButton: true, confirmButtonText: "Delete", ...swalTheme,
    });
    if (!res.isConfirmed) return;
    try {
      await deleteDoc(doc(db, "tracks", t.id));
      // also take it out of any playlist that used it
      await Promise.all(
        playlists
          .filter((p) => (p.trackIds || []).includes(t.id))
          .map((p) => updateDoc(doc(db, "playlists", p.id), { trackIds: arrayRemove(t.id) }))
      );
      if (tEditing === t.id) resetTrack();
      load();
    } catch (err) {
      fail("Could not delete", err);
    }
  };

  /* ---------------- playlists ---------------- */
  const resetPlaylist = () => { setPForm(emptyPlaylist); setPEditing(null); };

  const toggleInPlaylist = (id) =>
    setPForm((f) => ({
      ...f,
      trackIds: f.trackIds.includes(id) ? f.trackIds.filter((x) => x !== id) : [...f.trackIds, id],
    }));

  const move = (i, dir) =>
    setPForm((f) => {
      const a = [...f.trackIds];
      const j = i + dir;
      if (j < 0 || j >= a.length) return f;
      [a[i], a[j]] = [a[j], a[i]];
      return { ...f, trackIds: a };
    });

  const savePlaylist = async (e) => {
    e.preventDefault();
    if (pForm.trackIds.length === 0) {
      Swal.fire({ icon: "warning", title: "Pick at least one song", ...swalTheme });
      return;
    }
    setPSaving(true);
    try {
      const data = { name: pForm.name.trim(), trackIds: pForm.trackIds };
      if (pEditing) await updateDoc(doc(db, "playlists", pEditing), data);
      else await addDoc(collection(db, "playlists"), { ...data, createdAt: serverTimestamp() });
      await Swal.fire({ icon: "success", title: pEditing ? "Playlist updated!" : "Playlist created!", timer: 1300, showConfirmButton: false, ...swalTheme });
      resetPlaylist();
      load();
    } catch (err) {
      fail("Could not save playlist", err);
    } finally {
      setPSaving(false);
    }
  };

  const editPlaylist = (p) => {
    setPEditing(p.id);
    setPForm({ name: p.name || "", trackIds: (p.trackIds || []).filter((id) => trackById.has(id)) });
  };

  const setActive = async (id) => {
    try {
      await setDoc(doc(db, "settings", "music"), { activePlaylistId: id });
      setActiveId(id);
    } catch (err) {
      fail("Could not change the active playlist", err);
    }
  };

  const deletePlaylist = async (p) => {
    const res = await Swal.fire({
      icon: "warning", title: "Delete this playlist?", text: p.name,
      showCancelButton: true, confirmButtonText: "Delete", ...swalTheme,
    });
    if (!res.isConfirmed) return;
    try {
      await deleteDoc(doc(db, "playlists", p.id));
      if (activeId === p.id) await setActive(null);
      if (pEditing === p.id) resetPlaylist();
      load();
    } catch (err) {
      fail("Could not delete", err);
    }
  };

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-brand-soft">Admin: Music</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/admin" className="glass px-4 py-2 text-sm hover:bg-white/10 transition">Projects</Link>
            <Link to="/admin/certificates" className="glass px-4 py-2 text-sm hover:bg-white/10 transition">Certificates</Link>
            <Link to="/admin/messages" className="glass px-4 py-2 text-sm hover:bg-white/10 transition">Messages</Link>
            <Link to="/" className="glass px-4 py-2 text-sm hover:bg-white/10 transition">View site</Link>
            <button
              onClick={() => signOut(auth)}
              className="glass px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/10 transition"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        {/* ---------- SONGS ---------- */}
        <h2 className="mt-10 text-2xl font-semibold">1. Songs</h2>
        <div className="mt-4 grid lg:grid-cols-5 gap-8 items-start">
          <form onSubmit={saveTrack} className="glass p-6 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{tEditing ? "Edit song" : "Add a song"}</h3>
              {tEditing && (
                <button type="button" onClick={resetTrack} className="text-white/60 hover:text-white flex items-center gap-1 text-sm">
                  <X size={14} /> Cancel
                </button>
              )}
            </div>

            <label className="glass flex items-center justify-center gap-2 px-4 py-3 cursor-pointer hover:bg-white/10 transition">
              <Upload size={16} />
              {audioPct !== null ? `Uploading ${audioPct}%` : tForm.audioUrl ? "Audio uploaded (choose another)" : "Upload audio file (mp3)"}
              <input type="file" accept="audio/*" onChange={onAudioFile} disabled={audioPct !== null} className="hidden" />
            </label>
            {audioPct !== null && (
              <div className="h-1.5 rounded bg-white/10">
                <div className="h-full rounded bg-brand transition-all" style={{ width: `${audioPct}%` }} />
              </div>
            )}
            {tForm.audioUrl && <audio controls src={tForm.audioUrl} className="w-full h-10" />}

            <input name="title" required value={tForm.title} onChange={tChange} placeholder="Song title" className={inputClass} />
            <input name="artist" required value={tForm.artist} onChange={tChange} placeholder="Artist name" className={inputClass} />
            <input name="album" value={tForm.album} onChange={tChange} placeholder="Album (optional)" className={inputClass} />

            <label className="glass flex items-center justify-center gap-2 px-4 py-3 cursor-pointer hover:bg-white/10 transition">
              <Upload size={16} />
              {coverUploading ? "Uploading cover..." : "Upload album cover"}
              <input type="file" accept="image/*" onChange={onCoverFile} disabled={coverUploading} className="hidden" />
            </label>
            {tForm.coverUrl && (
              <img src={tForm.coverUrl} alt="cover preview" className="w-28 h-28 rounded-full object-cover mx-auto" />
            )}

            <button
              type="submit"
              disabled={tSaving || audioPct !== null || coverUploading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-brand hover:bg-brand-soft transition font-medium disabled:opacity-60"
            >
              <Plus size={16} /> {tSaving ? "Saving..." : tEditing ? "Update song" : "Add song"}
            </button>
          </form>

          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xl font-semibold">Your songs ({tracks.length})</h3>
            {tracks.length === 0 && <p className="text-white/50">No songs yet. Upload your first one on the left.</p>}
            {tracks.map((t) => (
              <div key={t.id} className="glass p-4 flex items-center gap-4">
                <img src={t.coverUrl || "/profile.jpg"} alt="" className="w-14 h-14 rounded-full object-cover bg-white/5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{t.title}</p>
                  <p className="text-xs text-white/50 truncate">{t.artist}{t.album ? ` · ${t.album}` : ""}</p>
                </div>
                <button onClick={() => editTrack(t)} className="p-2 rounded-lg hover:bg-white/10 transition" title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => deleteTrack(t)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- PLAYLISTS ---------- */}
        <h2 className="mt-14 text-2xl font-semibold">2. Playlists</h2>
        <p className="mt-1 text-sm text-white/60">
          The playlist marked <b>Active</b> is what visitors hear. With no active playlist, every song plays in upload order.
        </p>
        <div className="mt-4 grid lg:grid-cols-5 gap-8 items-start">
          <form onSubmit={savePlaylist} className="glass p-6 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{pEditing ? "Edit playlist" : "Create a playlist"}</h3>
              {pEditing && (
                <button type="button" onClick={resetPlaylist} className="text-white/60 hover:text-white flex items-center gap-1 text-sm">
                  <X size={14} /> Cancel
                </button>
              )}
            </div>

            <input
              required
              value={pForm.name}
              onChange={(e) => setPForm({ ...pForm, name: e.target.value })}
              placeholder="Playlist name"
              className={inputClass}
            />

            <p className="text-xs tracking-widest text-white/50">PICK SONGS</p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {tracks.length === 0 && <p className="text-sm text-white/40">Add songs first.</p>}
              {tracks.map((t) => (
                <label key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pForm.trackIds.includes(t.id)}
                    onChange={() => toggleInPlaylist(t.id)}
                    className="accent-red-500"
                  />
                  <span className="text-sm truncate">{t.title} <span className="text-white/40">· {t.artist}</span></span>
                </label>
              ))}
            </div>

            {pForm.trackIds.length > 0 && (
              <>
                <p className="text-xs tracking-widest text-white/50">PLAY ORDER</p>
                <div className="space-y-1">
                  {pForm.trackIds.map((id, i) => (
                    <div key={id} className="flex items-center gap-2 glass px-3 py-2">
                      <span className="text-xs text-white/40 w-5">{i + 1}</span>
                      <span className="flex-1 text-sm truncate">{trackById.get(id)?.title}</span>
                      <button type="button" onClick={() => move(i, -1)} className="p-1 hover:bg-white/10 rounded" aria-label="Move up">
                        <ArrowUp size={14} />
                      </button>
                      <button type="button" onClick={() => move(i, 1)} className="p-1 hover:bg-white/10 rounded" aria-label="Move down">
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={pSaving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-brand hover:bg-brand-soft transition font-medium disabled:opacity-60"
            >
              <Plus size={16} /> {pSaving ? "Saving..." : pEditing ? "Update playlist" : "Create playlist"}
            </button>
          </form>

          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xl font-semibold">Your playlists ({playlists.length})</h3>
            {playlists.length === 0 && <p className="text-white/50">No playlists yet.</p>}
            {playlists.map((p) => (
              <div key={p.id} className={`glass p-4 flex items-center gap-3 ${activeId === p.id ? "border-brand/60" : ""}`}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {p.name}
                    {activeId === p.id && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-brand">ACTIVE</span>}
                  </p>
                  <p className="text-xs text-white/50">{(p.trackIds || []).length} songs</p>
                </div>
                {activeId !== p.id && (
                  <button onClick={() => setActive(p.id)} className="px-3 py-1.5 text-xs rounded-lg glass hover:bg-white/10 transition">
                    Set active
                  </button>
                )}
                <button onClick={() => editPlaylist(p)} className="p-2 rounded-lg hover:bg-white/10 transition" title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => deletePlaylist(p)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {activeId && (
              <button onClick={() => setActive(null)} className="text-xs text-white/50 hover:text-white underline">
                Stop using a playlist (play all songs)
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
