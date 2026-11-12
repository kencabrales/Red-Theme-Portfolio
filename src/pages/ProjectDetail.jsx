import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Code2,
  ExternalLink,
  Github,
  Layers3,
  ListChecks,
  Rocket,
  Target,
  Users,
} from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { plainTextToHtml, sanitizeRichText } from "../utils/richText";

const panelClass =
  "rounded-3xl border border-white/10 bg-white/[0.035] shadow-[0_18px_60px_rgba(0,0,0,0.16)]";

function SectionHeading({ eyebrow, title, icon: Icon }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      {Icon && (
        <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand/25 bg-brand/10 text-brand-soft">
          <Icon size={19} />
        </span>
      )}
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-soft/75">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
      </div>
    </div>
  );
}

function TextList({ items, numbered = false }) {
  if (!Array.isArray(items) || !items.some((item) => String(item || "").trim())) return null;

  return (
    <ul className="space-y-3">
      {items.filter((item) => String(item || "").trim()).map((item, index) => (
        <li key={index} className="flex items-start gap-3 text-sm leading-7 text-white/70">
          <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand/10 text-[11px] font-bold text-brand-soft">
            {numbered ? String(index + 1).padStart(2, "0") : "✦"}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, loading } = useProjects();
  const [activeImage, setActiveImage] = useState(0);
  const project = projects.find((item) => item.id === id);

  useEffect(() => {
    setActiveImage(0);
  }, [id]);

  const galleryImages = [
    ...new Set(
      [project?.imageUrl, ...(Array.isArray(project?.galleryImages) ? project.galleryImages : [])]
        .filter(Boolean)
    ),
  ];
  const projectIndex = projects.findIndex((item) => item.id === id);
  const previousProject = projectIndex > 0 ? projects[projectIndex - 1] : null;
  const nextProject = projectIndex >= 0 && projectIndex < projects.length - 1
    ? projects[projectIndex + 1]
    : null;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className={panelClass + " px-6 py-5 text-sm text-white/60"}>Loading project...</div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-2xl font-bold">Project not found.</p>
        <Link to="/#portfolio" className="rounded-xl bg-brand px-6 py-3 font-semibold text-white">
          Back to portfolio
        </Link>
      </main>
    );
  }

  const descriptionHtml = sanitizeRichText(
    project.fullDescription ||
      plainTextToHtml(project.description || project.shortDescription || "")
  );
  const teamMembers = Array.isArray(project.teamMembers) ? project.teamMembers : [];
  const objectives = Array.isArray(project.objectives) ? project.objectives : [];
  const contributions = Array.isArray(project.contributions) ? project.contributions : [];
  const customSections = Array.isArray(project.customSections) ? project.customSections : [];
  const facts = [
    { label: "Project type", value: project.projectType || project.category || "Project" },
    { label: "My role", value: project.role },
    { label: "Timeline", value: project.duration },
    { label: "Year", value: project.year },
  ].filter((fact) => fact.value);

  const changeImage = (direction) => {
    setActiveImage((current) =>
      (current + direction + galleryImages.length) % galleryImages.length
    );
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_8%,rgb(var(--glow)/0.16),transparent_32%),radial-gradient(circle_at_90%_35%,rgb(var(--glow)/0.09),transparent_28%)] px-5 pb-16 pt-8 md:px-8 md:pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/55">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 transition hover:border-brand/40 hover:bg-brand/10 hover:text-white"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <Link to="/#portfolio" className="transition hover:text-white">Portfolio</Link>
          <ChevronRight size={14} />
          <span className="max-w-[48vw] truncate text-white/85">{project.title}</span>
        </div>

        <header className="relative mt-7 overflow-hidden rounded-[2rem] border border-brand/20 bg-gradient-to-br from-[#2a0b13]/95 via-[#18090e]/95 to-[#10080c] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:p-9 lg:p-11">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-brand/10 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-brand/35 bg-brand/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-soft">
                  {project.category || "Project"}
                </span>
                {project.year && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-white/45">
                    <CalendarDays size={13} /> {project.year}
                  </span>
                )}
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {project.title}
              </h1>
              {project.shortDescription && (
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/65 sm:text-lg">
                  {project.shortDescription}
                </p>
              )}
              <div className="mt-7 flex flex-wrap gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand/15 transition hover:-translate-y-0.5 hover:bg-brand-soft"
                  >
                    <ExternalLink size={16} /> View live project
                  </a>
                )}
                {project.repositoryUrl && (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/10"
                  >
                    <Github size={16} /> Source code
                  </a>
                )}
              </div>
            </div>

            {facts.length > 0 && (
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                {facts.map((fact) => (
                  <div key={fact.label} className="rounded-2xl border border-white/10 bg-black/20 p-3.5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-soft/70">
                      {fact.label}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold leading-5 text-white/85">{fact.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-brand via-brand-soft/70 to-transparent" />
        </header>

        {galleryImages.length > 0 && (
          <section className="mt-9">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-soft/75">
                  Visual showcase
                </p>
                <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Inside the project</h2>
              </div>
              {galleryImages.length > 1 && (
                <span className="text-xs tabular-nums text-white/45">
                  {String(activeImage + 1).padStart(2, "0")} / {String(galleryImages.length).padStart(2, "0")}
                </span>
              )}
            </div>

            <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#080609] shadow-[0_22px_70px_rgba(0,0,0,0.3)]">
              <img
                src={galleryImages[Math.min(activeImage, galleryImages.length - 1)]}
                alt={project.title + " preview " + (activeImage + 1)}
                className="max-h-[680px] min-h-[220px] w-full object-contain"
              />
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => changeImage(-1)}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/70 text-white transition hover:bg-brand sm:left-5 sm:h-12 sm:w-12"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={() => changeImage(1)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/70 text-white transition hover:bg-brand sm:right-5 sm:h-12 sm:w-12"
                  >
                    <ChevronRight size={22} />
                  </button>
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
                    aria-label={"Show project image " + (index + 1)}
                    aria-pressed={activeImage === index}
                    className={
                      "shrink-0 overflow-hidden rounded-xl border-2 transition " +
                      (activeImage === index
                        ? "border-brand opacity-100"
                        : "border-white/10 opacity-55 hover:opacity-100")
                    }
                  >
                    <img src={image} alt="" className="h-16 w-24 object-cover sm:h-20 sm:w-32" />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <div className={"mt-9 grid gap-5 " + (project.projectOutput ? "lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)]" : "grid-cols-1")}>
          <section className={panelClass + " p-6 sm:p-8"}>
            <SectionHeading eyebrow="The story" title="Project overview" icon={Layers3} />
            {descriptionHtml ? (
              <div className="rich-content text-white/75" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
            ) : (
              <p className="text-sm leading-7 text-white/55">A detailed overview has not been added yet.</p>
            )}
          </section>

          {project.projectOutput && (
            <aside className={panelClass + " flex flex-col justify-center p-6 sm:p-7"}>
              <SectionHeading eyebrow="The result" title="Project outcome" icon={Rocket} />
              <p className="text-sm leading-7 text-white/70">{project.projectOutput}</p>
            </aside>
          )}
        </div>

        {objectives.some((item) => String(item || "").trim()) && (
          <section className={panelClass + " mt-5 p-6 sm:p-8"}>
            <SectionHeading eyebrow="Purpose & direction" title="Project objectives" icon={Target} />
            <TextList items={objectives} numbered />
          </section>
        )}

        {contributions.some((item) => String(item || "").trim()) && (
          <section className={panelClass + " mt-5 p-6 sm:p-8"}>
            <SectionHeading eyebrow="Hands-on experience" title="My contributions" icon={Rocket} />
            <div className="grid gap-3 md:grid-cols-2">
              {contributions.filter((item) => String(item || "").trim()).map((item, index) => (
                <div key={index} className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-black/15 p-4">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand-soft">
                    <Code2 size={15} />
                  </span>
                  <p className="text-sm leading-7 text-white/70">{item}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {Array.isArray(project.techUsed) && project.techUsed.length > 0 && (
          <section className={panelClass + " mt-5 p-6 sm:p-8"}>
            <SectionHeading eyebrow="Built with" title="Technologies & tools" icon={Layers3} />
            <div className="flex flex-wrap gap-2.5">
              {project.techUsed.map((technology) => (
                <span key={technology} className="rounded-full border border-brand/25 bg-brand/[0.09] px-4 py-2 text-sm font-medium text-brand-soft/90">
                  {technology}
                </span>
              ))}
            </div>
          </section>
        )}

        {customSections.filter((section) => section?.title || section?.content).map((section, index) => {
          const html = sanitizeRichText(plainTextToHtml(section.content || section.body || ""));
          return (
            <section key={section.id || index} className={panelClass + " mt-5 p-6 sm:p-8"}>
              <SectionHeading eyebrow={"Project notes / " + String(index + 1).padStart(2, "0")} title={section.title || "Additional information"} icon={ListChecks} />
              {html && <div className="rich-content text-white/70" dangerouslySetInnerHTML={{ __html: html }} />}
            </section>
          );
        })}

        {teamMembers.some((member) => String(member || "").trim()) && (
          <section className={panelClass + " mt-5 p-6 sm:p-8"}>
            <SectionHeading eyebrow="People behind the work" title="Project team" icon={Users} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.filter((member) => String(member || "").trim()).map((member, index) => (
                <div key={index} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/15 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brand/25 bg-brand/10 text-xs font-bold text-brand-soft">
                    {member.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-white/75">{member}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <nav className="mt-10 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-y border-white/10 py-5">
          <div>
            {previousProject ? (
              <Link to={"/project/" + previousProject.id} className="group inline-flex items-center gap-2 text-left">
                <ArrowLeft size={16} className="text-brand-soft transition group-hover:-translate-x-1" />
                <span>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">Previous project</span>
                  <span className="mt-1 block max-w-[30vw] truncate text-sm font-semibold text-white/80 group-hover:text-brand-soft">{previousProject.title}</span>
                </span>
              </Link>
            ) : <span />}
          </div>
          <span className="text-xs tabular-nums text-white/35">
            {projectIndex >= 0 ? String(projectIndex + 1).padStart(2, "0") + " / " + String(projects.length).padStart(2, "0") : ""}
          </span>
          <div className="text-right">
            {nextProject ? (
              <Link to={"/project/" + nextProject.id} className="group inline-flex items-center gap-2 text-right">
                <span>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">Next project</span>
                  <span className="mt-1 block max-w-[30vw] truncate text-sm font-semibold text-white/80 group-hover:text-brand-soft">{nextProject.title}</span>
                </span>
                <ArrowRight size={16} className="text-brand-soft transition group-hover:translate-x-1" />
              </Link>
            ) : <span />}
          </div>
        </nav>

        <div className="mt-6 text-center">
          <Link to="/#portfolio" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-xs font-semibold text-white/55 transition hover:border-brand/40 hover:bg-brand/10 hover:text-white">
            <ArrowLeft size={14} /> Back to all projects
          </Link>
        </div>
      </div>
    </main>
  );
}
