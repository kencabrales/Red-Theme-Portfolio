import { Code2, Award, Globe, FileText, Sparkles } from "lucide-react";
import Reveal from "./Reveal";

const stats = [
  { icon: Code2, label: "TOTAL PROJECTS", desc: "Web, design, and editing work delivered", value: 13 },
  { icon: Award, label: "CERTIFICATES", desc: "Professional skills validated", value: 3 },
  { icon: Globe, label: "YEARS OF EXPERIENCE", desc: "Continuous learning journey", value: 2 },
];

export default function About() {
  return (
    <section id="about" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* heading */}
        <Reveal>
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-brand-soft">About Me</h2>
            <p className="mt-3 flex items-center justify-center gap-2 text-white/80">
              <Sparkles size={18} className="text-brand-soft" />
              Transforming ideas into digital experiences
              <Sparkles size={18} className="text-brand-soft" />
            </p>
          </div>
        </Reveal>

        {/* two columns */}
        <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
          <Reveal x={-40} y={0}>
            <div>
              <h3 className="text-4xl font-bold text-brand-soft">Hello, I'm</h3>
              <h3 className="text-4xl font-bold mt-1">Ken Ashly Cabrales</h3>
              <p className="mt-6 text-white/70 leading-relaxed">
                Write your short bio here: your studies, your focus, and what drives you.
              </p>

              <blockquote className="glass mt-6 px-5 py-4 italic text-white/90">
                "Your favorite quote or motto goes here."
              </blockquote>

              <div className="mt-6 flex gap-4">
                <a
                  href="/cv.pdf"
                  download
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-brand hover:bg-brand-soft transition font-medium"
                >
                  <FileText size={18} /> Download CV
                </a>
                <a
                  href="#portfolio"
                  className="px-6 py-3 rounded-lg glass hover:bg-white/10 transition font-medium"
                >
                  {"</>"} View Projects
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal x={40} y={0} delay={0.2} className="flex justify-center">
            <img
              src="/profile.jpg"
              alt="Profile"
              className="w-72 h-72 md:w-96 md:h-96 rounded-full object-cover shadow-[0_0_80px_rgba(239,68,68,0.45)]"
            />
          </Reveal>
        </div>

        {/* stat cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {stats.map(({ icon: Icon, label, desc, value }, i) => (
            <Reveal key={label} delay={i * 0.15} className="h-full">
              <div className="glass p-6 flex items-start gap-4 hover:-translate-y-1 transition h-full">
                <div className="p-3 rounded-xl border border-brand/40 text-brand-soft">
                  <Icon size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-xs tracking-widest text-white/60">{label}</p>
                  <p className="text-sm text-white/80 mt-1">{desc}</p>
                </div>
                <span className="text-3xl font-bold">{value}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}