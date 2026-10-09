import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { LogOut, Mail, Trash2, Check } from "lucide-react";
import { auth, db } from "../firebase";

const swalTheme = { background: "#1a0508", color: "#fff", confirmButtonColor: "#ef4444" };

export default function AdminMessages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Could not load messages", text: err.message, ...swalTheme });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleRead = async (m) => {
    await updateDoc(doc(db, "messages", m.id), { read: !m.read });
    load();
  };

  const handleDelete = async (m) => {
    const res = await Swal.fire({
      icon: "warning",
      title: "Delete this message?",
      text: `From ${m.name}`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      ...swalTheme,
    });
    if (!res.isConfirmed) return;
    await deleteDoc(doc(db, "messages", m.id));
    load();
  };

  const unread = items.filter((m) => !m.read).length;

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-brand-soft">
            Admin: Messages {unread > 0 && <span className="text-base text-white/60">({unread} unread)</span>}
          </h1>
          <div className="flex items-center gap-3">
            <Link to="/admin" className="glass px-4 py-2 text-sm hover:bg-white/10 transition">Projects</Link>
            <Link to="/admin/music" className="glass px-4 py-2 text-sm hover:bg-white/10 transition">Music</Link>
            <Link to="/admin/certificates" className="glass px-4 py-2 text-sm hover:bg-white/10 transition">Certificates</Link>
            <Link to="/" className="glass px-4 py-2 text-sm hover:bg-white/10 transition">View site</Link>
            <button
              onClick={() => signOut(auth)}
              className="glass px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/10 transition"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          {loading && <p className="text-white/50">Loading...</p>}
          {!loading && items.length === 0 && <p className="text-white/50">No messages yet.</p>}

          {items.map((m) => (
            <div key={m.id} className={`glass p-5 ${m.read ? "opacity-70" : "border-brand/50"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {m.name}
                    {!m.read && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-brand">NEW</span>}
                  </p>
                  <p className="text-sm text-white/60">{m.email}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {m.createdAt?.toDate?.().toLocaleString() || ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${m.email}`}
                    className="p-2 rounded-lg hover:bg-white/10 transition"
                    title="Reply by email"
                  >
                    <Mail size={16} />
                  </a>
                  <button
                    onClick={() => toggleRead(m)}
                    className="p-2 rounded-lg hover:bg-white/10 transition"
                    title={m.read ? "Mark as unread" : "Mark as read"}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(m)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="mt-4 text-white/85 whitespace-pre-wrap break-words">{m.message}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
