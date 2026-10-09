import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  addDoc, collection, deleteDoc, doc, getDocs,
  orderBy, query, serverTimestamp, updateDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { LogOut, Pencil, Trash2, Plus, X, Upload } from "lucide-react";
import { auth, db } from "../firebase";
import { uploadImage } from "../utils/uploadImage";

const swalTheme = { background: "#1a0508", color: "#fff", confirmButtonColor: "#ef4444" };
const emptyForm = { title: "", issuer: "", imageUrl: "" };

export default function AdminCertificates() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const q = query(collection(db, "certificates"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => { setForm(emptyForm); setEditingId(null); };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      Swal.fire({ icon: "error", title: "Upload failed", text: err.message, ...swalTheme });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        title: form.title.trim(),
        issuer: form.issuer.trim(),
        imageUrl: form.imageUrl.trim(),
      };
      if (editingId) {
        await updateDoc(doc(db, "certificates", editingId), data);
      } else {
        await addDoc(collection(db, "certificates"), { ...data, createdAt: serverTimestamp() });
      }
      await Swal.fire({ icon: "success", title: editingId ? "Updated!" : "Saved!", timer: 1400, showConfirmButton: false, ...swalTheme });
      reset();
      load();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Could not save", text: err.message, ...swalTheme });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm({ title: c.title || "", issuer: c.issuer || "", imageUrl: c.imageUrl || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (c) => {
    const res = await Swal.fire({
      icon: "warning",
      title: "Delete this certificate?",
      text: c.title,
      showCancelButton: true,
      confirmButtonText: "Delete",
      ...swalTheme,
    });
    if (!res.isConfirmed) return;
    await deleteDoc(doc(db, "certificates", c.id));
    if (editingId === c.id) reset();
    load();
  };

  const inputClass =
    "w-full glass px-4 py-3 bg-white/5 outline-none focus:border-brand transition placeholder:text-white/40";

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-brand-soft">Admin: Certificates</h1>
          <div className="flex items-center gap-3">
            <Link to="/admin" className="glass px-4 py-2 text-sm hover:bg-white/10 transition">Projects</Link>
            <Link to="/admin/music" className="glass px-4 py-2 text-sm hover:bg-white/10 transition">Music</Link>
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

        <div className="mt-10 grid lg:grid-cols-5 gap-8 items-start">
          <form onSubmit={handleSubmit} className="glass p-6 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{editingId ? "Edit certificate" : "Add new certificate"}</h2>
              {editingId && (
                <button type="button" onClick={reset} className="text-white/60 hover:text-white flex items-center gap-1 text-sm">
                  <X size={14} /> Cancel
                </button>
              )}
            </div>

            <input name="title" required value={form.title} onChange={handleChange} placeholder="Certificate title" className={inputClass} />
            <input name="issuer" required value={form.issuer} onChange={handleChange} placeholder="Issuer (e.g. Dicoding, Coursera)" className={inputClass} />

            <label className="glass flex items-center justify-center gap-2 px-4 py-3 cursor-pointer hover:bg-white/10 transition">
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload image from computer"}
              <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="hidden" />
            </label>
            <input name="imageUrl" required value={form.imageUrl} onChange={handleChange} placeholder="...or paste an image URL" className={inputClass} />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="preview" className="w-full h-40 object-cover rounded-xl" onError={(e) => (e.currentTarget.style.display = "none")} />
            )}

            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-brand hover:bg-brand-soft transition font-medium disabled:opacity-60"
            >
              <Plus size={16} /> {saving ? "Saving..." : editingId ? "Update certificate" : "Add certificate"}
            </button>
          </form>

          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-xl font-semibold">Your certificates ({items.length})</h2>
            {items.length === 0 && (
              <p className="text-white/50">No certificates in the database yet. Add your first one on the left.</p>
            )}
            {items.map((c) => (
              <div key={c.id} className="glass p-4 flex items-center gap-4">
                <img src={c.imageUrl} alt="" className="w-20 h-14 rounded-lg object-cover bg-white/5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{c.title}</p>
                  <p className="text-xs text-white/50">{c.issuer}</p>
                </div>
                <button onClick={() => handleEdit(c)} className="p-2 rounded-lg hover:bg-white/10 transition" title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(c)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
