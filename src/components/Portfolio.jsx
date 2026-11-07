import { useState } from "react";
import { Link } from "react-router-dom";
import { Code2, Award, Layers, ExternalLink, ArrowRight } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { useCertificates } from "../hooks/useCertificates";
import { techstack } from "../data/techstack";
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

  const filtered = projects.filter((project) => project.category === subTab);

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
                onClick={() => setMainTab(id)}
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
                <div className="glass overflow-hidden transition hover:-translate-y-1">
                  <img
                    src={certificate.imageUrl}
                    alt={certificate.title}
                    className="aspect-video w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold">{certificate.title}</h3>
                    <p className="text-sm text-white/60">{certificate.issuer}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {mainTab === "tech" && (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {techstack.map(({ name, icon: Icon, badge, color }, index) => (
              <Reveal key={name} delay={(index % 6) * 0.05}>
                <div className="glass flex flex-col items-center gap-3 py-8 transition hover:-translate-y-1 hover:bg-white/10">
                  {Icon ? (
                    <Icon size={44} color={color} />
                  ) : (
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-lg border-2 text-xl font-bold"
                      style={{ color, borderColor: color }}
                    >
                      {badge}
                    </span>
                  )}
                  <span className="text-sm font-semibold">{name}</span>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
