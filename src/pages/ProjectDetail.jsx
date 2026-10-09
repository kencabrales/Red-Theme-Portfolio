import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useProjects } from "../hooks/useProjects";

export default function ProjectDetail() {
   const { id } = useParams();
   const navigate = useNavigate();
   const { projects, loading } = useProjects();
   const project = projects.find((p) => p.id === id);

   if (loading) {
     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
   }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-2xl">Project not found.</p>
        <Link to="/" className="px-6 py-3 rounded-lg bg-brand">Go home</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12 bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.15),transparent_50%)]">
      <div className="max-w-6xl mx-auto">
        {/* back + breadcrumb */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button
            onClick={() => navigate(-1)}
            className="glass flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <Link to="/#portfolio" className="text-white/60 hover:text-white">Projects</Link>
          <ChevronRight size={14} className="text-white/40" />
          <span className="text-white">{project.title}</span>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              {project.title}
            </h1>
            <div className="mt-6 h-1 w-24 bg-brand rounded" />
            <p className="mt-8 text-white/80 leading-relaxed text-lg">
              {project.description}
            </p>

            {project.techUsed?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {project.techUsed.map((t) => (
                  <span key={t} className="glass px-4 py-1.5 text-sm">{t}</span>
                ))}
              </div>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand hover:bg-brand-soft transition font-medium"
              >
                <ExternalLink size={16} /> View Live Site
              </a>
            )}
          </div>

          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full rounded-2xl shadow-[0_0_80px_rgba(239,68,68,0.25)]"
          />
        </div>
      </div>
    </main>
  );
}