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

  const filtered = projects.filter((p) => p.category === subTab);

  return (
    <section id="portfolio" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-brand">Portfolio Showcase</h2>
            <p className="mt-3 text-white/70 max-w-2xl mx-auto">
              Explore my journey through projects, certifications, and technical expertise.
            </p>
          </div>
        </Reveal>

        {/* main tabs */}
        <Reveal delay={0.1}>
          <div className="glass mt-12 p-2 grid grid-cols-3 gap-2">
            {mainTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMainTab(id)}
                className={`py-4 rounded-xl flex flex-col items-center gap-1 font-semibold transition ${
                  mainTab === id ? "bg-brand/25" : "text-white/70 hover:bg-white/5"
                }`}
              >
                <Icon size={20} /> {label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* PROJECTS */}
        {mainTab === "projects" && (
          <>
            <div className="glass mt-8 mx-auto w-fit p-1.5 flex gap-1">
              {subTabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setSubTab(t)}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition ${
                    subTab === t ? "bg-brand text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 0.1}>
                  <div className="group relative overflow-hidden rounded-2xl aspect-[4/5] bg-white/5">
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 p-5">
                      <h3 className="text-xl font-bold">{p.title}</h3>
                      <div className="max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 overflow-hidden transition-all duration-300">
                        <p className="mt-2 text-sm text-white/80 line-clamp-2">{p.description}</p>
                        <div className="mt-3 flex gap-3">
                          {p.liveUrl && (
                            <a
                              href={p.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-sm"
                            >
                              <ExternalLink size={14} /> VIEW APP
                            </a>
                          )}
                          <Link
                            to={`/project/${p.id}`}
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

        {/* CERTIFICATES */}
        {mainTab === "certificates" && (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 0.1}>
                <div className="glass overflow-hidden hover:-translate-y-1 transition">
                  <img src={c.imageUrl} alt={c.title} className="w-full aspect-video object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="text-sm text-white/60">{c.issuer}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {/* TECH STACK */}
        {mainTab === "tech" && (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {techstack.map(({ name, icon: Icon, badge, color }, i) => (
              <Reveal key={name} delay={(i % 6) * 0.05}>
                <div className="glass py-8 flex flex-col items-center gap-3 hover:-translate-y-1 hover:bg-white/10 transition">
                  {Icon ? (
                    <Icon size={44} color={color} />
                  ) : (
                    <span
                      className="w-11 h-11 flex items-center justify-center rounded-lg border-2 text-xl font-bold"
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