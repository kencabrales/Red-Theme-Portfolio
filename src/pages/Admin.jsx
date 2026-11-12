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
import {
  ExternalLink,
  Code2,
  ImagePlus,
  LogOut,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { auth, db } from "../firebase";
import { techstack } from "../data/techstack";
import RichTextEditor from "../components/RichTextEditor";
import { plainTextToHtml, sanitizeRichText } from "../utils/richText";
import { uploadImage } from "../utils/uploadImage";

const swalTheme = {
  background: "var(--color-ink)",
  color: "#fff",
  confirmButtonColor: "var(--color-brand)",
};

const emptyForm = {
  title: "",
  shortDescription: "",
  fullDescription: "",
  category: "Project",
  year: "",
  imageUrl: "",
  galleryImages: [],
  liveUrl: "",
  repositoryUrl: "",
  projectType: "",
  role: "",
  keyFeatures: [],
  objectives: [],
  contributions: [],
  teamMembers: [],
  customSections: [],
  techUsed: [],
};

const inputClass =
  "w-full rounded-xl glass px-4 py-3 bg-white/5 outline-none focus:border-brand transition placeholder:text-white/40";

export default function Admin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [techSearch, setTechSearch] = useState("");
  const [galleryUrl, setGalleryUrl] = useState("");

  const load = async () => {
    const projectsQuery = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(projectsQuery);
    setItems(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  };

  useEffect(() => {
    load().catch((error) => console.error("Could not load projects:", error));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setTechSearch("");
    setGalleryUrl("");
  };

  const handleThumbnailFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const url = await uploadImage(file);
      setForm((current) => ({ ...current, imageUrl: url }));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Thumbnail upload failed",
        text: error.message,
        ...swalTheme,
      });
    } finally {
      setUploadingThumbnail(false);
      event.target.value = "";
    }
  };

  const handleGalleryFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploadingGallery(true);
    try {
      const results = await Promise.allSettled(files.map((file) => uploadImage(file)));
      const uploaded = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);
      const failedCount = results.length - uploaded.length;

      if (uploaded.length) {
        setForm((current) => ({
          ...current,
          galleryImages: Array.from(new Set([...current.galleryImages, ...uploaded])),
        }));
      }

      if (failedCount) {
        Swal.fire({
          icon: "warning",
          title: "Some images could not be uploaded",
          text: uploaded.length + " uploaded, " + failedCount + " failed. You can retry the failed images.",
          ...swalTheme,
        });
      }
    } finally {
      setUploadingGallery(false);
      event.target.value = "";
    }
  };

  const addGalleryUrl = () => {
    const value = galleryUrl.trim();
    if (!value) return;

    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error("Use an http or https image URL.");
      }
      setForm((current) => ({
        ...current,
        galleryImages: Array.from(new Set([...current.galleryImages, value])),
      }));
      setGalleryUrl("");
    } catch {
      Swal.fire({
        icon: "error",
        title: "Invalid image URL",
        text: "Enter a valid image URL beginning with http:// or https://.",
        ...swalTheme,
      });
    }
  };

  const addTech = (technology) => {
    const clean = technology.trim();
    if (!clean) return;

    setForm((current) => {
      const exists = current.techUsed.some(
        (item) => item.toLowerCase() === clean.toLowerCase()
      );
      return exists ? current : { ...current, techUsed: [...current.techUsed, clean] };
    });
    setTechSearch("");
  };

  const removeTech = (technology) => {
    setForm((current) => ({
      ...current,
      techUsed: current.techUsed.filter((item) => item !== technology),
    }));
  };

  const updateLineList = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value.split("\n").map((item) => item.trim()),
    }));
  };

  const addCustomSection = () => {
    setForm((current) => ({
      ...current,
      customSections: [...current.customSections, { id: String(Date.now()), title: "", content: "" }],
    }));
  };

  const updateCustomSection = (index, field, value) => {
    setForm((current) => ({
      ...current,
      customSections: current.customSections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section
      ),
    }));
  };

  const removeCustomSection = (index) => {
    setForm((current) => ({
      ...current,
      customSections: current.customSections.filter((_, sectionIndex) => sectionIndex !== index),
    }));
  };

  const techSuggestions = techstack
    .map((item) => item.name)
    .filter((name) =>
      name.toLowerCase().includes(techSearch.trim().toLowerCase()) &&
      !form.techUsed.some((selected) => selected.toLowerCase() === name.toLowerCase())
    )
    .slice(0, 8);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const title = form.title.trim();
    const shortDescription = form.shortDescription.trim();
    const imageUrl = form.imageUrl.trim();
    const fullDescription = sanitizeRichText(form.fullDescription);
    const fullDescriptionText = fullDescription
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!title || !shortDescription || !imageUrl || !fullDescriptionText) {
      Swal.fire({
        icon: "info",
        title: "Complete the project details",
        text: "Add a title, short description, full description, and thumbnail before saving.",
        ...swalTheme,
      });
      return;
    }

    setSaving(true);
    try {
      const data = {
        title,
        shortDescription,
        description: shortDescription,
        fullDescription,
        category: form.category,
        year: form.year.trim(),
        imageUrl,
        galleryImages: form.galleryImages.filter(Boolean),
        liveUrl: form.liveUrl.trim(),
        repositoryUrl: form.repositoryUrl.trim(),
        projectType: form.projectType.trim(),
        role: form.role.trim(),
        keyFeatures: form.keyFeatures.map((item) => item.trim()).filter(Boolean),
        objectives: form.objectives.map((item) => item.trim()).filter(Boolean),
        contributions: form.contributions.map((item) => item.trim()).filter(Boolean),
        teamMembers: form.teamMembers.map((item) => item.trim()).filter(Boolean),
        customSections: form.customSections
          .map((section) => ({
            id: section.id || String(Date.now()),
            title: (section.title || "").trim(),
            content: (section.content || "").trim(),
          }))
          .filter((section) => section.title || section.content),
        techUsed: form.techUsed,
      };

      if (editingId) {
        await updateDoc(doc(db, "projects", editingId), data);
      } else {
        await addDoc(collection(db, "projects"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }

      await Swal.fire({
        icon: "success",
        title: editingId ? "Project updated" : "Project added",
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
        title: "Could not save project",
        text: error.message,
        ...swalTheme,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project) => {
    const legacyTech = Array.isArray(project.techUsed)
      ? project.techUsed
      : typeof project.techUsed === "string"
        ? project.techUsed.split(",").map((item) => item.trim()).filter(Boolean)
        : [];

    setEditingId(project.id);
    setForm({
      title: project.title || "",
      shortDescription: project.shortDescription || project.description || "",
      fullDescription: project.fullDescription || plainTextToHtml(project.description || ""),
      category: project.category || "Project",
      year: project.year || "",
      imageUrl: project.imageUrl || "",
      galleryImages: Array.isArray(project.galleryImages) ? project.galleryImages : [],
      liveUrl: project.liveUrl || "",
      repositoryUrl: project.repositoryUrl || "",
      projectType: project.projectType || "",
      role: project.role || "",
      keyFeatures: Array.isArray(project.keyFeatures) ? project.keyFeatures : [],
      objectives: Array.isArray(project.objectives) ? project.objectives : [],
      contributions: Array.isArray(project.contributions) ? project.contributions : [],
      teamMembers: Array.isArray(project.teamMembers) ? project.teamMembers : [],
      customSections: Array.isArray(project.customSections) ? project.customSections : [],
      techUsed: legacyTech,
    });
    setTechSearch("");
    setGalleryUrl("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (project) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this project?",
      text: project.title,
      showCancelButton: true,
      confirmButtonText: "Delete",
      ...swalTheme,
    });
    if (!result.isConfirmed) return;

    try {
      await deleteDoc(doc(db, "projects", project.id));
      if (editingId === project.id) reset();
      await load();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Could not delete project",
        text: error.message,
        ...swalTheme,
      });
    }
  };

  return (
    <main className="min-h-screen px-5 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-soft/70">
              Portfolio management
            </p>
            <h1 className="mt-2 text-3xl font-bold text-brand-soft md:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-white/55">
              Create and manage the projects and designs shown on your portfolio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin/certificates" className="glass px-4 py-2 text-sm hover:bg-white/10 transition">Certificates</Link>
            <Link to="/admin/music" className="glass px-4 py-2 text-sm hover:bg-white/10 transition">Music</Link>
            <Link to="/admin/messages" className="glass px-4 py-2 text-sm hover:bg-white/10 transition">Messages</Link>
            <Link to="/" className="glass px-4 py-2 text-sm hover:bg-white/10 transition">View site</Link>
            <button
              onClick={() => signOut(auth)}
              className="glass flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(350px,0.85fr)]">
          <form onSubmit={handleSubmit} className="glass space-y-7 p-5 md:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-soft/70">
                  {editingId ? "Update entry" : "New entry"}
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {editingId ? "Edit project" : "Add a project or design"}
                </h2>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={reset}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>

            <section className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">01 / Basic information</p>
                <h3 className="mt-1 text-lg font-semibold">What are you showcasing?</h3>
              </div>
              <input
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="Project or design title"
                className={inputClass}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">Short description</label>
                <textarea
                  name="shortDescription"
                  required
                  rows={2}
                  maxLength={220}
                  value={form.shortDescription}
                  onChange={handleChange}
                  placeholder="A short summary shown when visitors hover over the homepage card"
                  className={inputClass}
                />
                <p className="mt-1 text-right text-xs text-white/35">
                  {form.shortDescription.length}/220 characters
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass + " bg-ink"}
                >
                  <option value="Project">Project</option>
                  <option value="Design">Design</option>
                  <option value="Editing">Editing</option>
                </select>
              </div>
            </section>

            <section className="space-y-4 border-t border-white/10 pt-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">02 / Full description</p>
                <h3 className="mt-1 text-lg font-semibold">Tell the complete story</h3>
                <p className="mt-1 text-sm text-white/50">
                  Format the description just like a document: headings, text sizes, bold, italic, underline, and lists.
                </p>
              </div>
              <RichTextEditor
                value={form.fullDescription}
                onChange={(value) => setForm((current) => ({ ...current, fullDescription: value }))}
              />
            </section>

            <section className="space-y-5 border-t border-white/10 pt-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">03 / Project information</p>
                <h3 className="mt-1 text-lg font-semibold">Add context visitors should know</h3>
                <p className="mt-1 text-sm text-white/50">
                  These details become compact information cards on the project page. Leave anything blank when it does not apply.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/75">Project year</label>
                  <input name="year" type="number" min="1900" max="2100" value={form.year} onChange={handleChange} placeholder="e.g. 2026" className={inputClass} />
                  <p className="mt-1 text-xs text-white/35">Displayed beside the Project label on the detail page.</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/75">Project type</label>
                  <input name="projectType" value={form.projectType} onChange={handleChange} placeholder="e.g. Capstone project, Course project, Personal project" className={inputClass} />
                </div>
              </div>

              <div className="rounded-2xl border border-brand/20 bg-brand/[0.045] p-4 sm:p-5">
                <div className="mb-4">
                  <h4 className="font-semibold text-white/90">My role & contributions</h4>
                  <p className="mt-1 text-xs leading-5 text-white/45">These appear together in one section on the public project page.</p>
                </div>
                <input name="role" value={form.role} onChange={handleChange} placeholder="My role (e.g. UI/UX Designer, Team Leader)" className={inputClass} />
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-white/75">What I contributed</label>
                  <textarea rows={5} value={form.contributions.join("\n")} onChange={(event) => updateLineList("contributions", event.target.value)} placeholder={"One contribution per line\nExample: Designed the interface\nBuilt the authentication flow"} className={inputClass} />
                  <p className="mt-1 text-xs text-white/35">Enter one contribution per line.</p>
                </div>
              </div>


              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">Key features</label>
                <textarea rows={4} value={form.keyFeatures.join("\n")} onChange={(event) => updateLineList("keyFeatures", event.target.value)} placeholder={"One feature per line\nExample: Secure user login and authentication"} className={inputClass} />
                <p className="mt-1 text-xs text-white/35">List the main functions or capabilities visitors should know about.</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/75">Project objectives</label>
                  <textarea rows={5} value={form.objectives.join("\n")} onChange={(event) => updateLineList("objectives", event.target.value)} placeholder={"One objective per line\nExample: Build a responsive dashboard"} className={inputClass} />
                  <p className="mt-1 text-xs text-white/35">Enter one objective per line.</p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">Project team members</label>
                <textarea rows={3} value={form.teamMembers.join("\n")} onChange={(event) => updateLineList("teamMembers", event.target.value)} placeholder={"One name per line\nAdd team members or collaborators"} className={inputClass} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-white/85">Additional content sections</h4>
                    <p className="mt-1 text-xs text-white/45">Create optional sections such as Key features, Challenges, Process, or Results.</p>
                  </div>
                  <button type="button" onClick={addCustomSection} className="inline-flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-xs font-semibold text-brand-soft transition hover:bg-brand/20">
                    <Plus size={14} /> Add section
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {form.customSections.map((section, index) => (
                    <div key={section.id || index} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
                      <div className="flex items-center gap-2">
                        <input value={section.title || ""} onChange={(event) => updateCustomSection(index, "title", event.target.value)} placeholder="Section title (e.g. Key features)" className={inputClass} />
                        <button type="button" onClick={() => removeCustomSection(index)} aria-label="Remove section" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white/45 transition hover:bg-red-500/15 hover:text-red-300">
                          <X size={16} />
                        </button>
                      </div>
                      <textarea rows={4} value={section.content || ""} onChange={(event) => updateCustomSection(index, "content", event.target.value)} placeholder="Write details for this section..." className={inputClass} />
                    </div>
                  ))}
                  {form.customSections.length === 0 && (
                    <p className="py-3 text-center text-xs text-white/35">No additional sections added.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4 border-t border-white/10 pt-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">04 / Thumbnail</p>
                <h3 className="mt-1 text-lg font-semibold">Homepage cover image</h3>
                <p className="mt-1 text-sm text-white/50">
                  This is the main image visitors see in the Projects or Design grid.
                </p>
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-4 transition hover:border-brand/60 hover:bg-white/[0.06]">
                <Upload size={17} />
                {uploadingThumbnail ? "Uploading thumbnail..." : "Choose thumbnail from computer"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFile}
                  disabled={uploadingThumbnail}
                  className="hidden"
                />
              </label>
              <input
                name="imageUrl"
                required
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="Or paste the thumbnail image URL"
                className={inputClass}
              />
              {form.imageUrl && (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  <img
                    src={form.imageUrl}
                    alt="Thumbnail preview"
                    className="aspect-video max-h-64 w-full object-cover"
                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                  />
                </div>
              )}
            </section>

            <section className="space-y-4 border-t border-white/10 pt-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">05 / Project gallery</p>
                <h3 className="mt-1 text-lg font-semibold">Add screenshots and extra images</h3>
                <p className="mt-1 text-sm text-white/50">
                  Upload multiple UI screenshots, mockups, artwork, or other project images. Visitors can browse them in a visual gallery and open each image full size.
                </p>
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-4 transition hover:border-brand/60 hover:bg-white/[0.06]">
                <ImagePlus size={17} />
                {uploadingGallery ? "Uploading gallery images..." : "Choose multiple gallery images"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryFiles}
                  disabled={uploadingGallery}
                  className="hidden"
                />
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={galleryUrl}
                  onChange={(event) => setGalleryUrl(event.target.value)}
                  placeholder="Or paste an image URL"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={addGalleryUrl}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm hover:bg-white/10"
                >
                  <Plus size={15} /> Add URL
                </button>
              </div>

              {form.galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {form.galleryImages.map((url, index) => (
                    <div key={url} className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/20">
                      <img
                        src={url}
                        alt={"Gallery image " + (index + 1)}
                        className="aspect-video w-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-xs">
                        Image {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setForm((current) => ({
                          ...current,
                          galleryImages: current.galleryImages.filter((item) => item !== url),
                        }))}
                        aria-label={"Remove gallery image " + (index + 1)}
                        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/75 text-white opacity-100 transition hover:bg-red-500 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-5 text-center text-sm text-white/40">
                  No gallery images added yet. The thumbnail will be used as the detail-page image.
                </p>
              )}
            </section>

            <section className="space-y-4 border-t border-white/10 pt-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">06 / Links and technologies</p>
                <h3 className="mt-1 text-lg font-semibold">Where can visitors learn more?</h3>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">Live URL <span className="text-white/35">(optional)</span></label>
                <div className="relative">
                  <ExternalLink size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <input
                    name="liveUrl"
                    type="url"
                    value={form.liveUrl}
                    onChange={handleChange}
                    placeholder="https://your-deployed-project.com"
                    className={inputClass + " pl-11"}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">Source code URL <span className="text-white/35">(optional)</span></label>
                <div className="relative">
                  <Code2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <input name="repositoryUrl" type="url" value={form.repositoryUrl} onChange={handleChange} placeholder="https://github.com/..." className={inputClass + " pl-11"} />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">Tech stack used</label>
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
                  <input
                    value={techSearch}
                    onChange={(event) => setTechSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTech(techSuggestions[0] || techSearch);
                      }
                    }}
                    placeholder="Search HTML, CSS, React, Firebase..."
                    className={inputClass + " pl-11"}
                  />
                </div>

                {techSearch.trim() && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#16080b] p-2">
                    {techSuggestions.map((technology) => (
                      <button
                        key={technology}
                        type="button"
                        onClick={() => addTech(technology)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
                      >
                        {technology}
                        <Plus size={14} className="text-brand-soft" />
                      </button>
                    ))}
                    {!techstack.some((item) => item.name.toLowerCase() === techSearch.trim().toLowerCase()) && (
                      <button
                        type="button"
                        onClick={() => addTech(techSearch)}
                        className="mt-1 flex w-full items-center justify-between rounded-lg border-t border-white/10 px-3 py-2 text-left text-sm text-brand-soft hover:bg-white/10"
                      >
                        Add custom technology: "{techSearch.trim()}"
                        <Plus size={14} />
                      </button>
                    )}
                    {techSuggestions.length === 0 && techstack.some((item) => item.name.toLowerCase() === techSearch.trim().toLowerCase()) && (
                      <p className="px-3 py-2 text-sm text-white/40">Already selected.</p>
                    )}
                  </div>
                )}

                <div className="mt-3 flex min-h-12 flex-wrap gap-2">
                  {form.techUsed.map((technology) => (
                    <span
                      key={technology}
                      className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1.5 text-sm text-white/90"
                    >
                      {technology}
                      <button
                        type="button"
                        onClick={() => removeTech(technology)}
                        aria-label={"Remove " + technology}
                        className="text-white/50 hover:text-white"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                  {form.techUsed.length === 0 && (
                    <p className="text-sm text-white/35">No technologies selected yet.</p>
                  )}
                </div>
                <p className="mt-2 text-xs text-white/40">
                  Choose a suggestion or type any custom technology and press Enter.
                </p>
              </div>
            </section>

            <button
              type="submit"
              disabled={saving || uploadingThumbnail || uploadingGallery}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 font-semibold transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={17} />
              {saving ? "Saving project..." : editingId ? "Save project changes" : "Add project to portfolio"}
            </button>
          </form>

          <aside className="space-y-4 xl:sticky xl:top-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Portfolio content</p>
                <h2 className="mt-1 text-2xl font-semibold">Your entries</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/60">
                {items.length} total
              </span>
            </div>

            {items.length === 0 && (
              <p className="glass p-5 text-sm text-white/50">
                No projects in the database yet. Add your first entry using the form.
              </p>
            )}

            {items.map((project) => (
              <div key={project.id} className="glass flex gap-3 p-3">
                <img
                  src={project.imageUrl}
                  alt=""
                  className="h-20 w-24 shrink-0 rounded-lg bg-white/5 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{project.title}</p>
                  <p className="mt-1 text-xs text-white/45">{project.category || "Project"}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {(project.galleryImages || []).length} gallery images · {(project.techUsed || []).length} technologies
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    onClick={() => handleEdit(project)}
                    className="rounded-lg p-2 transition hover:bg-white/10"
                    title="Edit"
                    aria-label={"Edit " + project.title}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(project)}
                    className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/20"
                    title="Delete"
                    aria-label={"Delete " + project.title}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </main>
  );
}
