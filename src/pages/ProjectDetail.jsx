import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { plainTextToHtml, sanitizeRichText } from "../utils/richText";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, loading } = useProjects();
  const [activeImage, setActiveImage] = useState(0);
  const project = projects.find((item) => item.id === id);

  useEffect(() => {
    setActiveImage(0);
  }, [id]);

  const storedGallery = Array.isArray(project?.galleryImages)
    ? project.galleryImages.filter(Boolean)
    : [];
  const galleryImages = storedGallery.length
    ? storedGallery
    : project?.imageUrl
      ? [project.imageUrl]
      : [];

  const showPrevious = () => {
    setActiveImage((current) => (current - 1 + galleryImages.length) % galleryImages.length);
  };

  const showNext = () => {
    setActiveImage((current) => (current + 1) % galleryImages.length);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-2xl">Project not found.</p>
        <Link to="/" className="rounded-lg bg-brand px-6 py-3">Go home</Link>
      </div>
    );
  }

  const descriptionHtml = sanitizeRichText(
    project.fullDescription || plainTextToHtml(project.description || project.shortDescription || "")
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgb(var(--glow)/0.15),transparent_50%)] px-5 py-10 md:px-6 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button
            onClick={() => navigate(-1)}
            className="glass flex items-center gap-2 px-4 py-2 transition hover:bg-white/10"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <Link to="/#portfolio" className="text-white/60 hover:text-white">Portfolio</Link>
          <ChevronRight size={14} className="text-white/40" />
          <span className="text-white">{project.title}</span>
        </div>

        <div className="mt-10 grid items-start gap-10 md:mt-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-soft/75">
              {project.category || "Project"}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
              {project.title}
            </h1>
            <div className="mt-6 h-1 w-24 rounded bg-brand" />

            {project.shortDescription && (
              <p className="mt-7 text-base font-medium leading-relaxed text-white/65">
                {project.shortDescription}
              </p>
            )}

            <div
              className="rich-content mt-7 text-white/80"
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />

            {Array.isArray(project.techUsed) && project.techUsed.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-white/50">
                  Technologies used
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.techUsed.map((technology) => (
                    <span key={technology} className="glass rounded-full px-4 py-2 text-sm">
                      {technology}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-medium transition hover:bg-brand-soft"
              >
                <ExternalLink size={16} /> View Live Site
              </a>
            )}
          </div>

          <div className="min-w-0">
            {galleryImages.length > 0 ? (
              <>
                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[0_0_80px_rgb(var(--glow)/0.2)]">
                  <img
                    src={galleryImages[Math.min(activeImage, galleryImages.length - 1)]}
                    alt={project.title + " gallery image " + (activeImage + 1)}
                    className="aspect-[4/3] w-full object-contain md:aspect-[5/4]"
                  />

                  {galleryImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={showPrevious}
                        aria-label="Previous image"
                        className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/65 text-white transition hover:bg-brand"
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <button
                        type="button"
                        onClick={showNext}
                        aria-label="Next image"
                        className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/65 text-white transition hover:bg-brand"
                      >
                        <ChevronRight size={22} />
                      </button>
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white/80">
                        {activeImage + 1} / {galleryImages.length}
                      </span>
                    </>
                  )}
                </div>

                {galleryImages.length > 1 && (
                  <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                    {galleryImages.map((image, index) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        aria-label={"Show image " + (index + 1)}
                        aria-pressed={activeImage === index}
                        className={
                          "shrink-0 overflow-hidden rounded-lg border-2 transition " +
                          (activeImage === index ? "border-brand opacity-100" : "border-white/10 opacity-55 hover:opacity-100")
                        }
                      >
                        <img
                          src={image}
                          alt=""
                          className="h-16 w-24 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="glass flex aspect-[4/3] items-center justify-center rounded-2xl text-sm text-white/40">
                No project images have been added.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
