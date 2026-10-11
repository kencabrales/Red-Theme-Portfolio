import { TypeAnimation } from "react-type-animation";
import { FaGithub, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { ExternalLink, Mail } from "lucide-react";
import AiSpace from "./AiSpace";

const AI_SCALE = 0.75;
const chips = ["React", "JavaScript", "Node.js", "Tailwind"];

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* red glow background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(239,68,68,0.25),transparent_55%)]" />

      <div className="max-w-6xl mx-auto px-6 pt-28 grid md:grid-cols-2 gap-12 items-center">
        {/* left */}
        <div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
            Full Stack <br />
            <span className="bg-gradient-to-r from-brand to-brand-soft bg-clip-text text-transparent">
              Developer
            </span>
          </h1>

          <TypeAnimation
            sequence={["Web Developer", 2000, "UI/UX Designer", 2000, "Video Editor", 2000]}
            repeat={Infinity}
            className="block mt-6 text-2xl text-white/90"
          />

          <p className="mt-6 text-white/70 leading-relaxed max-w-xl">
            A creative digital professional with a passion for turning ideas into
            fast, intuitive and future-ready web applications.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {chips.map((c) => (
              <span key={c} className="glass px-4 py-1.5 text-sm">{c}</span>
            ))}
          </div>

          <div className="mt-8 flex gap-4">
            <a href="#portfolio" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-brand hover:bg-brand-soft transition font-medium">
              Projects <ExternalLink size={16} />
            </a>
            <a href="#contact" className="flex items-center gap-2 px-6 py-3 rounded-lg glass hover:bg-white/10 transition font-medium">
              Contact <Mail size={16} />
            </a>
          </div>

          <div className="mt-8 flex gap-4 text-xl text-white/70">
            <a href="https://github.com/" target="_blank" className="hover:text-brand-soft"><FaGithub /></a>
            <a href="https://linkedin.com/" target="_blank" className="hover:text-brand-soft"><FaLinkedinIn /></a>
            <a href="https://instagram.com/" target="_blank" className="hover:text-brand-soft"><FaInstagram /></a>
          </div>
        </div>

        {/* right: floating mockup card */}
        <div className="float hidden md:block">
          <div className="glass p-2 mx-auto" style={{ maxWidth: 500 * AI_SCALE + 50 }}>
            <AiSpace scale={AI_SCALE} />
            </div>
        </div>
      </div>
    </section>
  );
}