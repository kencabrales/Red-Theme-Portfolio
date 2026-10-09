import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { FaCompactDisc } from "react-icons/fa";
import { usePlayer } from "../context/PlayerContext";

const links = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "portfolio", label: "Portfolio" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const { playing, openModal } = usePlayer();
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    links.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition ${
        scrolled ? "bg-ink/70 backdrop-blur-lg" : ""
      }`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
  <a href="#home" className="text-xl font-semibold text-brand">Ken Cabrales</a>
  <button
    onClick={openModal}
    aria-label="Open music player"
    title="Music"
    className="text-brand-soft hover:text-white transition"
  >
    <FaCompactDisc
      size={22}
      className="vinyl-spin"
      style={{ animationPlayState: playing ? "running" : "paused" }}
    />
  </button>
</div>

        <ul className="hidden md:flex gap-8">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className={`pb-1 font-medium border-b-2 transition ${
                  active === l.id
                    ? "text-brand-soft border-brand"
                    : "border-transparent hover:text-brand-soft"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <ul className="md:hidden bg-ink/95 px-6 pb-4 space-y-3">
          {links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={() => setOpen(false)}>{l.label}</a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}