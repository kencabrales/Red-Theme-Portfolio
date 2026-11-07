import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { LogOut, Pencil, Trash2, Plus, X, Upload } from "lucide-react";
import { auth, db } from "../firebase";
import { uploadImage } from "../utils/uploadImage";

const swalTheme = {
  background: "var(--color-ink)",
  color: "#fff",
  confirmButtonColor: "var(--color-brand)",
};
const emptyForm = { title: "", issuer: "", overview: "", imageUrl: "" };

export default function AdminCertificates() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const certificatesQuery = query(
      collection(db, "certificates"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(certificatesQuery);
    setItems(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  };

  useEffect(() => {
    load().catch((error) => console.error("Could not load certificates:", error));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((current) => ({ ...current, imageUrl: url }));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Upload failed",
        text: error.message,
        ...swalTheme,
      });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const data = {
        title: form.title.trim(),
        issuer: form.issuer.trim(),
        overview: form.overview.trim(),
        imageUrl: form.imageUrl.trim(),
      };

      if (editingId) {
        await updateDoc(doc(db, "certificates", editingId), data);
      } else {
        await addDoc(collection(db, "certificates"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }

      await Swal.fire({
        icon: "success",
        title: editingId ? "Certificate updated" : "Certificate saved",
        timer: 1400,
        showConfirmButton: false,
        ...swalTheme,
      });
      reset();
      await load();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Could not save certificate",
        text: error.message,
        ...swalTheme,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (certificate) => {
    setEditingId(certificate.id);
    setForm({
      title: certificate.title || "",
      issuer: certificate.issuer || "",
      overview: certificate.overview || "",
      imageUrl: certificate.imageUrl || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (certificate) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this certificate?",
      text: certificate.title,
      showCancelButton: true,
      confirmButtonText: "Delete",
      ...swalTheme,
    });
    if (!result.isConfirmed) return;

    try {
      await deleteDoc(doc(db, "certificates", certificate.id));
      if (editingId === certificate.id) reset();
      await load();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Could not delete certificate",
        text: error.message,
        ...swalTheme,
      });
    }
  };

  const inputClass =
    "w-full glass px-4 py-3 bg-white/5 outline-none focus:border-brand transition placeholder:text-white/40";

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-soft/65">
              Portfolio management
            </p>
            <h1 className="mt-1 text-3xl font-bold text-brand-soft">Admin: Certificates</h1>
            <p className="mt-2 text-sm text-white/50">
              Add an overview that visitors can read when they open a certificate.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin" className="glass px-4 py-2 text-sm transition hover:bg-white/10">Projects</Link>
            <Link to="/admin/music" className="glass px-4 py-2 text-sm transition hover:bg-white/10">Music</Link>
            <Link to="/admin/messages" className="glass px-4 py-2 text-sm transition hover:bg-white/10">Messages</Link>
            <Link to="/" className="glass px-4 py-2 text-sm transition hover:bg-white/10">View site</Link>
            <button
              onClick={() => signOut(auth)}
              className="glass flex items-center gap-2 px-4 py-2 text-sm transition hover:bg-white/10"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-5">
          <form onSubmit={handleSubmit} className="glass space-y-4 p-6 lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                {editingId ? "Edit certificate" : "Add new certificate"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={reset}
                  className="flex items-center gap-1 text-sm text-white/60 transition hover:text-white"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>

            <input
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="Certificate title"
              className={inputClass}
            />
            <input
              name="issuer"
              required
              value={form.issuer}
              onChange={handleChange}
              placeholder="Issuer (e.g. Dicoding, Coursera)"
              className={inputClass}
            />

            <div>
              <label htmlFor="certificate-overview" className="mb-2 block text-sm font-medium text-white/75">
                Overview <span className="text-white/35">(optional)</span>
              </label>
              <textarea
                id="certificate-overview"
                name="overview"
                rows={5}
                maxLength={1500}
                value={form.overview}
                onChange={handleChange}
                placeholder="Describe what this certificate covers, what you learned, or the skills you demonstrated..."
                className={inputClass}
              />
              <p className="mt-1 text-right text-xs text-white/35">
                {form.overview.length}/1500 characters
              </p>
            </div>

            <label className="glass flex cursor-pointer items-center justify-center gap-2 px-4 py-3 transition hover:bg-white/10">
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload image from computer"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <input
              name="imageUrl"
              required
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="...or paste an image URL"
              className={inputClass}
            />
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="Certificate preview"
                className="max-h-64 w-full rounded-xl border border-white/10 bg-black/20 object-contain"
                onError={(event) => { event.currentTarget.style.display = "none"; }}
              />
            )}

            <button
              type="submit"
              disabled={saving || uploading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 font-medium transition hover:bg-brand-soft disabled:opacity-60"
            >
              <Plus size={16} />
              {saving ? "Saving..." : editingId ? "Update certificate" : "Add certificate"}
            </button>
          </form>

          <div className="space-y-3 lg:col-span-3">
            <h2 className="text-xl font-semibold">Your certificates ({items.length})</h2>
            {items.length === 0 && (
              <p className="text-white/50">No certificates in the database yet. Add your first one on the left.</p>
            )}
            {items.map((certificate) => (
              <div key={certificate.id} className="glass flex items-center gap-4 p-4">
                <img
                  src={certificate.imageUrl}
                  alt=""
                  className="h-14 w-20 rounded-lg bg-white/5 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{certificate.title}</p>
                  <p className="text-xs text-white/50">{certificate.issuer}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-white/40">
                    {certificate.overview || "No overview added"}
                  </p>
                </div>
                <button
                  onClick={() => handleEdit(certificate)}
                  className="rounded-lg p-2 transition hover:bg-white/10"
                  title="Edit"
                  aria-label={"Edit " + certificate.title}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(certificate)}
                  className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/20"
                  title="Delete"
                  aria-label={"Delete " + certificate.title}
                >
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
