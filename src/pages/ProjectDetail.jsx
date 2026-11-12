import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  Code2, ExternalLink, GitBranch, Layers3, Lightbulb, ListChecks,
  Maximize2, Target, Users, X,
} from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { plainTextToHtml, sanitizeRichText } from "../utils/richText";

const panel = "rounded-3xl border border-white/10 bg-[#13090e]/75 shadow-[0_20px_65px_rgba(0,0,0,0.22)] backdrop-blur-sm";

function Eyebrow({ children }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-soft/75">{children}</p>;
}

function SectionTitle({ eyebrow, title, icon: Icon }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand/25 bg-brand/10 text-brand-soft">
        <Icon size={18} />
      </span>
      <div><Eyebrow>{eyebrow}</Eyebrow><h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h2></div>
    </div>
  );
}

function ListCards({ items, numbered = false }) {
  const values = (Array.isArray(items) ? items : []).filter((item) => String(item || "").trim());
  if (!values.length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {values.map((item, index) => (
        <div key={index} className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand/10 text-[11px] font-bold text-brand-soft">
            {numbered ? String(index + 1).padStart(2, "0") : "✦"}
          </span>
          <p className="text-sm leading-7 text-white/70">{item}</p>
        </div>
      ))}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, loading } = useProjects();
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const project = projects.find((item) => item.id === id);

  const galleryImages = [...new Set([
    project?.imageUrl,
    ...(Array.isArray(project?.galleryImages) ? project.galleryImages : []),
  ].filter(Boolean))];

  useEffect(() => {
    setActiveImage(0);
    setLightboxOpen(false);
  }, [id]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") setActiveImage((current) => (current + 1) % galleryImages.length);
      if (event.key === "ArrowLeft") setActiveImage((current) => (current - 1 + galleryImages.length) % galleryImages.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, galleryImages.length]);

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center px-5"><div className={panel + " px-6 py-5 text-sm text-white/60"}>Loading project...</div></main>;
  }

  if (!project) {
    return <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center"><p className="text-2xl font-bold">Project not found.</p><Link to="/#portfolio" className="rounded-xl bg-brand px-6 py-3 font-semibold text-white">Back to portfolio</Link></main>;
  }

  const projectIndex = projects.findIndex((item) => item.id === id);
  const previousProject = projectIndex > 0 ? projects[projectIndex - 1] : null;
  const nextProject = projectIndex >= 0 && projectIndex < projects.length - 1 ? projects[projectIndex + 1] : null;
  const descriptionHtml = sanitizeRichText(project.fullDescription || plainTextToHtml(project.description || project.shortDescription || ""));
  const projectType = project.projectType || project.category || "Project";
  const tech = Array.isArray(project.techUsed) ? project.techUsed : [];
  const objectives = Array.isArray(project.objectives) ? project.objectives : [];
  const contributions = Array.isArray(project.contributions) ? project.contributions : [];
  const keyFeatures = Array.isArray(project.keyFeatures) ? project.keyFeatures : [];
  const team = Array.isArray(project.teamMembers) ? project.teamMembers : [];
  const customSections = Array.isArray(project.customSections) ? project.customSections : [];
  const moveImage = (direction) => setActiveImage((current) => (current + direction + galleryImages.length) % galleryImages.length);

  return (
    <main className="min-h-screen overflow-hidden px-5 pb-20 pt-7 md:px-8 md:pt-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_8%,rgb(var(--glow)/0.19),transparent_32%),radial-gradient(ellipse_at_90%_42%,rgb(var(--glow)/0.1),transparent_34%)]" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-wrap items-center gap-3 text-sm text-white/50">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 transition hover:border-brand/40 hover:text-white"><ArrowLeft size={15}/> Back</button>
          <Link to="/#portfolio" className="hover:text-white">Portfolio</Link><span className="text-white/25">/</span><span className="max-w-[50vw] truncate text-white/80">{project.title}</span>
        </div>

        <header className="relative overflow-hidden rounded-[2rem] border border-brand/20 bg-gradient-to-br from-[#2b0c16] via-[#180a10] to-[#10080c] shadow-[0_28px_100px_rgba(0,0,0,0.35)]">
          <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-brand/20 blur-3xl"/>
          <div className="relative grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-brand/35 bg-brand/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-soft">{project.category || "Project"}</span>
                {projectType !== project.category && <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-semibold text-white/65">{projectType}</span>}
              </div>
              <Eyebrow>Selected work / {String(projectIndex + 1).padStart(2, "0")}</Eyebrow>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl">{project.title}</h1>
              {project.shortDescription && <p className="mt-5 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">{project.shortDescription}</p>}
              <div className="mt-7 flex flex-wrap gap-3">
                {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5 hover:bg-brand-soft"><ExternalLink size={16}/> View live project</a>}
                {project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/10"><GitBranch size={16}/> Source code</a>}
              </div>
            </div>
            {galleryImages[0] && <button type="button" onClick={() => setLightboxOpen(true)} className="group relative min-h-[270px] overflow-hidden border-t border-white/10 bg-black/30 text-left lg:min-h-[440px] lg:border-l lg:border-t-0">
              <img src={galleryImages[0]} alt={project.title + " project cover"} className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-[1.035] group-hover:opacity-100"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#10080c]/75 via-transparent to-[#10080c]/10"/>
              <span className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-xs font-semibold text-white backdrop-blur"><Maximize2 size={14}/> Explore visuals</span>
            </button>}
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-brand via-brand-soft/80 to-transparent"/>
        </header>

        <section className="mt-7 grid items-stretch gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
          <div className="flex flex-col gap-5">
            <section className={panel + " relative overflow-hidden p-5 sm:p-6"}>
              <div className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-brand/10 blur-3xl"/>
              <div className="relative">
                <Eyebrow>Project classification</Eyebrow>
                <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">{projectType}</h2>
                <p className="mt-2 text-sm leading-6 text-white/50">What kind of work this project represents.</p>
              </div>
            </section>

            <section className={panel + " flex-1 p-5 sm:p-7"}>
              <SectionTitle eyebrow="Project overview" title="Description" icon={Layers3}/>
              {descriptionHtml ? (
                <div className="rich-content text-sm leading-7 text-white/75 sm:text-base" dangerouslySetInnerHTML={{__html:descriptionHtml}}/>
              ) : (
                <p className="text-sm leading-7 text-white/50">A detailed project description has not been added yet.</p>
              )}
            </section>
          </div>

          <section className={panel + " relative min-w-0 overflow-hidden p-4 sm:p-5"}>
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/10 blur-3xl"/>
            <div className="relative">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand/25 bg-brand/10 text-brand-soft"><Layers3 size={18}/></span>
                  <div>
                    <Eyebrow>Visual documentation</Eyebrow>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">Project gallery</h2>
                    <p className="mt-1 text-xs text-white/45">Explore screenshots, designs, and project progress.</p>
                  </div>
                </div>
                {galleryImages.length > 0 && <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] font-semibold tabular-nums text-white/60">{String(activeImage + 1).padStart(2,"0")} <span className="text-white/30">/</span> {String(galleryImages.length).padStart(2,"0")}</span>}
              </div>

              {galleryImages.length > 0 ? (
                <>
                  <div className="group relative isolate overflow-hidden rounded-2xl border border-white/10 bg-[#080609] shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(120,25,45,0.13),transparent_60%)]"/>
                    <img
                      src={galleryImages[activeImage]}
                      alt={project.title + " gallery image " + (activeImage + 1)}
                      className="relative aspect-[16/10] max-h-[620px] w-full cursor-zoom-in object-contain"
                      onClick={() => setLightboxOpen(true)}
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent"/>
                    <span className="pointer-events-none absolute bottom-3 left-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">Preview / {String(activeImage + 1).padStart(2,"0")}</span>
                    {galleryImages.length > 1 && <>
                      <button type="button" onClick={() => moveImage(-1)} aria-label="Previous gallery image" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl border border-white/15 bg-black/75 text-white shadow-lg backdrop-blur transition hover:border-brand/50 hover:bg-brand sm:left-4 sm:h-11 sm:w-11"><ChevronLeft size={21}/></button>
                      <button type="button" onClick={() => moveImage(1)} aria-label="Next gallery image" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl border border-white/15 bg-black/75 text-white shadow-lg backdrop-blur transition hover:border-brand/50 hover:bg-brand sm:right-4 sm:h-11 sm:w-11"><ChevronRight size={21}/></button>
                    </>}
                    <button type="button" onClick={() => setLightboxOpen(true)} className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-black/70 px-3 py-2 text-[10px] font-semibold text-white/85 opacity-100 shadow-lg backdrop-blur transition hover:bg-brand sm:right-4 sm:top-4 sm:opacity-0 sm:group-hover:opacity-100"><Maximize2 size={13}/> Full view</button>
                  </div>

                  {galleryImages.length > 1 && (
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Browse images</span>
                        <span className="text-[10px] text-white/35">Select a thumbnail</span>
                      </div>
                      <div className="flex gap-2.5 overflow-x-auto pb-2">
                        {galleryImages.map((image,index) => (
                          <button
                            key={image}
                            type="button"
                            onClick={() => setActiveImage(index)}
                            aria-label={"Show gallery image " + (index + 1)}
                            aria-pressed={activeImage === index}
                            className={"group/thumb relative h-[68px] w-[92px] shrink-0 overflow-hidden rounded-xl border-2 bg-black/30 transition sm:h-[76px] sm:w-[108px] " + (activeImage === index ? "border-brand shadow-[0_0_0_2px_rgba(180,35,65,0.16)]" : "border-white/10 opacity-55 hover:border-white/30 hover:opacity-100")}
                          >
                            <img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover/thumb:scale-105"/>
                            <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-white/85">{String(index + 1).padStart(2,"0")}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex aspect-[16/10] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/20 px-5 text-center">
                  <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35"><Layers3 size={20}/></span>
                  <p className="text-sm font-semibold text-white/65">No gallery images yet</p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-white/35">Project screenshots and visuals will appear here when added by the administrator.</p>
                </div>
              )}
            </div>
          </section>
        </section>

        <div className="mt-12 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            {keyFeatures.length > 0 && <section className={panel + " p-6 sm:p-8"}><SectionTitle eyebrow="What it can do" title="Key features" icon={Lightbulb}/><ListCards items={keyFeatures}/></section>}
            {objectives.some((item) => String(item || "").trim()) && <section className={panel + " p-6 sm:p-8"}><SectionTitle eyebrow="Purpose & direction" title="Project objectives" icon={Target}/><ListCards items={objectives} numbered/></section>}
            {(project.role || contributions.some((item) => String(item || "").trim())) && <section className={panel + " relative overflow-hidden p-6 sm:p-8"}>
              <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-brand/10 blur-3xl"/>
              <div className="relative">
                <SectionTitle eyebrow="Your part in the build" title="My role & contributions" icon={Code2}/>
                <div className="grid gap-4 lg:grid-cols-[minmax(190px,0.72fr)_minmax(0,1.5fr)]">
                  <div className="relative overflow-hidden rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/20 via-brand/10 to-black/25 p-5 sm:p-6">
                    <div className="absolute -right-5 -top-6 opacity-[0.08]"><Code2 size={112}/></div>
                    <div className="relative">
                      <span className="grid h-10 w-10 place-items-center rounded-xl border border-brand/30 bg-black/20 text-brand-soft"><Code2 size={19}/></span>
                      <Eyebrow>My role</Eyebrow>
                      <p className="mt-2 text-lg font-bold leading-snug text-white sm:text-xl">{project.role || "Project contributor"}</p>
                      <p className="mt-3 text-xs leading-5 text-white/50">The responsibilities I took on throughout this project.</p>
                    </div>
                  </div>
                  {contributions.some((item) => String(item || "").trim()) && <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-5 sm:p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <Eyebrow>Hands-on work</Eyebrow>
                        <h3 className="mt-1 text-base font-semibold text-white">What I contributed</h3>
                      </div>
                      <span className="rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-[10px] font-bold tabular-nums text-brand-soft">{contributions.filter((item) => String(item || "").trim()).length} ITEMS</span>
                    </div>
                    <div className="space-y-2.5">
                      {contributions.filter((item) => String(item || "").trim()).map((item, index) => <div key={index} className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5 transition hover:border-brand/25 hover:bg-brand/[0.06]">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-brand/20 bg-brand/10 text-[10px] font-bold text-brand-soft">{String(index + 1).padStart(2,"0")}</span>
                        <p className="pt-0.5 text-sm leading-6 text-white/70 transition group-hover:text-white/90">{item}</p>
                      </div>)}
                    </div>
                  </div>}
                </div>
              </div>
            </section>}
            {customSections.filter((section) => section?.title || section?.content || section?.body).map((section,index) => {
              const html = sanitizeRichText(section.content || section.body || "");
              return <section key={section.id || index} className={panel + " p-6 sm:p-8"}><SectionTitle eyebrow={"Additional insight / " + String(index + 1).padStart(2,"0")} title={section.title || "Project notes"} icon={ListChecks}/>{html && <div className="rich-content text-white/70" dangerouslySetInnerHTML={{__html:html}}/>}</section>;
            })}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6">
            {tech.length > 0 && <section className={panel + " p-5"}><SectionTitle eyebrow="Built with" title="Tech & tools" icon={Layers3}/><div className="flex flex-wrap gap-2">{tech.map((item)=><span key={item} className="rounded-full border border-brand/25 bg-brand/[0.09] px-3 py-1.5 text-xs font-medium text-brand-soft/90">{item}</span>)}</div></section>}
            {team.some((member)=>String(member||"").trim()) && <section className={panel + " p-5"}><SectionTitle eyebrow="People behind the work" title="Project team" icon={Users}/><div className="space-y-3">{team.filter((member)=>String(member||"").trim()).map((member,index)=><div key={index} className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brand/25 bg-brand/10 text-xs font-bold text-brand-soft">{member.trim().charAt(0).toUpperCase()}</span><span className="text-sm text-white/75">{member}</span></div>)}</div></section>}
          </aside>
        </div>

        <nav className="mt-12 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-y border-white/10 py-6">
          <div>{previousProject ? <Link to={"/project/" + previousProject.id} className="group inline-flex items-center gap-2 text-left"><ArrowLeft size={16} className="text-brand-soft transition group-hover:-translate-x-1"/><span><span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">Previous project</span><span className="mt-1 block max-w-[30vw] truncate text-sm font-semibold text-white/80 group-hover:text-brand-soft">{previousProject.title}</span></span></Link> : <span/>}</div>
          <span className="text-xs tabular-nums text-white/35">{String(projectIndex + 1).padStart(2,"0")} / {String(projects.length).padStart(2,"0")}</span>
          <div className="text-right">{nextProject ? <Link to={"/project/" + nextProject.id} className="group inline-flex items-center gap-2 text-right"><span><span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">Next project</span><span className="mt-1 block max-w-[30vw] truncate text-sm font-semibold text-white/80 group-hover:text-brand-soft">{nextProject.title}</span></span><ArrowRight size={16} className="text-brand-soft transition group-hover:translate-x-1"/></Link> : <span/>}</div>
        </nav>
        <div className="mt-7 text-center"><Link to="/#portfolio" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-xs font-semibold text-white/55 transition hover:border-brand/40 hover:bg-brand/10 hover:text-white"><ArrowLeft size={14}/> Back to all projects</Link></div>
      </div>

      {lightboxOpen && galleryImages.length > 0 && <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-label="Project image viewer" onClick={(event)=>{if(event.target===event.currentTarget)setLightboxOpen(false);}}>
        <button type="button" onClick={()=>setLightboxOpen(false)} aria-label="Close image viewer" className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-brand"><X size={20}/></button>
        {galleryImages.length > 1 && <button type="button" onClick={()=>moveImage(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white hover:bg-brand sm:left-7"><ChevronLeft size={23}/></button>}
        <img src={galleryImages[activeImage]} alt={project.title + " image " + (activeImage+1)} className="max-h-[82vh] max-w-[88vw] object-contain"/>
        {galleryImages.length > 1 && <button type="button" onClick={()=>moveImage(1)} aria-label="Next image" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white hover:bg-brand sm:right-7"><ChevronRight size={23}/></button>}
        <span className="absolute bottom-5 text-xs tabular-nums text-white/60">{activeImage+1} / {galleryImages.length}</span>
      </div>}
    </main>
  );
}
