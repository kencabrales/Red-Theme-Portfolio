import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  Award,
  Layers,
  ExternalLink,
  ArrowRight,
  Expand,
  X,
} from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { useCertificates } from "../hooks/useCertificates";
import { techstackGroups } from "../data/techstack";
import Reveal from "./Reveal";

const mainTabs = [
  { id: "projects", label: "Projects", icon: Code2 },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "tech", label: "Tech Stack", icon: Layers },
];
const subTabs = ["Project", "Design", "Editing"];

export default function Portfolio() {
  const { projects } = useProjects();
  const { certificates } = useCertificates();
  const [mainTab, setMainTab] = useState("projects");
  const [subTab, setSubTab] = useState("Project");
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const filtered = projects.filter((project) => project.category === subTab);

  useEffect(() => {
    if (!selectedCertificate) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedCertificate(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCertificate]);

  const openCertificate = (certificate) => setSelectedCertificate(certificate);

  return (
    <section id="portfolio" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center">
            <h2 className="text-4xl font-bold text-brand md:text-5xl">Portfolio Showcase</h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/70">
              Explore my journey through projects, certifications, and technical expertise.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass mt-12 grid grid-cols-3 gap-2 p-2">
            {mainTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setMainTab(id);
                  setSelectedCertificate(null);
                }}
                className={
                  "flex flex-col items-center gap-1 rounded-xl py-4 font-semibold transition " +
                  (mainTab === id ? "bg-brand/25" : "text-white/70 hover:bg-white/5")
                }
              >
                <Icon size={20} /> {label}
              </button>
            ))}
          </div>
        </Reveal>

        {mainTab === "projects" && (
          <>
            <div className="glass mx-auto mt-8 flex w-fit gap-1 p-1.5">
              {subTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSubTab(tab)}
                  className={
                    "rounded-xl px-6 py-2.5 font-semibold transition " +
                    (subTab === tab ? "bg-brand text-white" : "text-white/70 hover:text-white")
                  }
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project, index) => (
                <Reveal key={project.id} delay={(index % 3) * 0.1}>
                  <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-white/5">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 p-5">
                      <h3 className="text-xl font-bold">{project.title}</h3>
                      <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-40 group-hover:opacity-100">
                        <p className="mt-2 line-clamp-2 text-sm text-white/80">
                          {project.shortDescription || project.description}
                        </p>
                        <div className="mt-3 flex gap-3">
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="glass flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
                            >
                              <ExternalLink size={14} /> VIEW APP
                            </a>
                          )}
                          <Link
                            to={"/project/" + project.id}
                            className="flex items-center gap-1 px-2 py-2 text-sm font-semibold"
                          >
                            Details <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full text-center text-white/50">Nothing here yet.</p>
              )}
            </div>
          </>
        )}

        {mainTab === "certificates" && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate, index) => (
              <Reveal key={certificate.id} delay={(index % 3) * 0.1}>
                <button
                  type="button"
                  onClick={() => openCertificate(certificate)}
                  aria-label={"View certificate: " + certificate.title}
                  className="glass group w-full overflow-hidden text-left transition hover:-translate-y-1 hover:border-brand/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <div className="relative overflow-hidden bg-black/20">
                    <img
                      src={certificate.imageUrl}
                      alt={certificate.title}
                      className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/35">
                      <span className="flex items-center gap-2 rounded-full border border-white/25 bg-black/65 px-4 py-2 text-xs font-semibold tracking-wide text-white opacity-0 transition group-hover:opacity-100">
                        <Expand size={14} /> VIEW CERTIFICATE
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{certificate.title}</h3>
                    <p className="text-sm text-white/60">{certificate.issuer}</p>
                    <p className="mt-3 text-xs font-medium text-brand-soft/80">
                      Click to view full certificate
                    </p>
                  </div>
                </button>
              </Reveal>
            ))}
            {certificates.length === 0 && (
              <p className="col-span-full text-center text-white/50">No certificates to display yet.</p>
            )}
          </div>
        )}

        {mainTab === "tech" && (
          <div className="mt-10">
            <Reveal delay={0.05}>
              <div className="mb-8 text-left">
                <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Technologies <span className="text-brand-soft">&amp; tools.</span>
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
                  Tools I've used in coursework, projects, and digital art.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {techstackGroups.map((group, index) => (
                <Reveal
                  key={group.id}
                  delay={(index % 2) * 0.08}
                  className={group.id === "creative" ? "h-full md:col-span-2" : "h-full"}
                >
                  <section className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.035] to-brand/[0.06] p-5 shadow-lg shadow-black/10 sm:p-6">
                    <h4 className="mb-5 text-base font-semibold text-white/85 sm:text-lg">
                      {group.title}
                    </h4>

                    <div className="flex flex-wrap gap-2.5">
                      {group.items.map(({ name, icon: Icon, badge, color }) => (
                        <div
                          key={name}
                          className="group flex min-h-[52px] items-center gap-2.5 rounded-xl border border-white/10 bg-black/20 px-3 py-2 transition duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:bg-brand/10"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.07]">
                            {Icon ? (
                              <Icon size={19} color={color} />
                            ) : (
                              <span className="text-xs font-bold" style={{ color }}>
                                {badge}
                              </span>
                            )}
                          </span>
                          <span className="whitespace-nowrap text-sm font-medium text-white/80 transition group-hover:text-white">
                            {name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedCertificate && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm md:p-6"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedCertificate(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="certificate-preview-title"
            aria-describedby="certificate-preview-overview"
            className="relative grid max-h-[94vh] w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl border border-white/15 bg-[#10090b] shadow-2xl lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]"
          >
            <div className="relative flex min-h-[260px] max-h-[58vh] items-center justify-center bg-black/60 p-4 sm:p-6 lg:max-h-[84vh] lg:min-h-[70vh]">
              <img
                src={selectedCertificate.imageUrl}
                alt={selectedCertificate.title + " certificate"}
                className="max-h-[52vh] max-w-full object-contain sm:max-h-[54vh] lg:max-h-[78vh]"
              />
              <span className="absolute bottom-3 left-4 rounded-full border border-white/10 bg-black/65 px-3 py-1 text-[11px] text-white/65">
                Full certificate preview
              </span>
              <button
                type="button"
                onClick={() => setSelectedCertificate(null)}
                aria-label="Close certificate preview"
                className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/75 text-white transition hover:bg-brand"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex max-h-[32vh] flex-col overflow-y-auto border-t border-white/10 p-6 sm:p-7 lg:max-h-[84vh] lg:border-l lg:border-t-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-soft/75">
                Certificate overview
              </p>
              <h3 id="certificate-preview-title" className="mt-3 text-2xl font-bold leading-tight">
                {selectedCertificate.title}
              </h3>
              <p className="mt-2 text-sm text-white/55">
                Issued by {selectedCertificate.issuer}
              </p>

              <div className="my-6 h-px w-full bg-white/10" />

              <h4 className="text-sm font-semibold text-white/85">About this certificate</h4>
              <p
                id="certificate-preview-overview"
                className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/65"
              >
                {selectedCertificate.overview?.trim() ||
                  "No overview has been added for this certificate yet."}
              </p>

              <div className="mt-auto pt-8">
                <button
                  type="button"
                  onClick={() => setSelectedCertificate(null)}
                  className="w-full rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/75 transition hover:border-brand/50 hover:bg-white/5 hover:text-white"
                >
                  Close preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
