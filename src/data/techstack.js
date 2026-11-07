import * as Si from "react-icons/si";

const tech = [
  { name: "HTML", iconName: "SiHtml5", color: "#e34f26", badge: "H" },
  { name: "CSS", iconName: "SiCss3", color: "#1572b6", badge: "C" },
  { name: "JavaScript", iconName: "SiJavascript", color: "#f7df1e", badge: "JS" },
  { name: "Tailwind CSS", iconName: "SiTailwindcss", color: "#38bdf8", badge: "Tw" },
  { name: "ReactJS", iconName: "SiReact", color: "#61dafb", badge: "Re" },
  { name: "Vite", iconName: "SiVite", color: "#a78bfa", badge: "Vi" },
  { name: "Node JS", iconName: "SiNodedotjs", color: "#68a063", badge: "No" },
  { name: "Bootstrap", iconName: "SiBootstrap", color: "#7952b3", badge: "B" },
  { name: "Firebase", iconName: "SiFirebase", color: "#ffca28", badge: "Fb" },
  { name: "Material UI", iconName: "SiMui", color: "#007fff", badge: "M" },
  { name: "Vercel", iconName: "SiVercel", color: "#ffffff", badge: "V" },
  { name: "Canva", iconName: "SiCanva", color: "#00c4cc", badge: "Ca" },
  { name: "Photoshop", iconName: "SiAdobephotoshop", color: "#31a8ff", badge: "Ps" },
  { name: "Figma", iconName: "SiFigma", color: "#f24e1e", badge: "Fi" },
  { name: "C", iconName: "SiC", color: "#A8B9CC", badge: "C" },
  { name: "C#", iconName: "SiCsharp", color: "#239120", badge: "C#" },
  { name: "Java", iconName: "SiJava", color: "#007396", badge: "Ja" },
  { name: "Dart", iconName: "SiDart", color: "#0175C2", badge: "Dt" },
  { name: "Flutter", iconName: "SiFlutter", color: "#02569B", badge: "Fl" },
  { name: "MongoDB", iconName: "SiMongodb", color: "#47A248", badge: "Mo" },
  { name: "SQL", iconName: "SiMysql", color: "#4479A1", badge: "SQL" },
  { name: "Blender", iconName: "SiBlender", color: "#F5792A", badge: "Bl" },
  { name: "CapCut", iconName: null, color: "#000000", badge: "Cc" },
  { name: "Microsoft Word", iconName: null, color: "#2B579A", badge: "Wd" },
  { name: "Excel", iconName: null, color: "#217346", badge: "Xl" },
  { name: "PowerPoint", iconName: null, color: "#B7472A", badge: "PP" },
];

export const techstack = tech.map(({ iconName, ...rest }) => ({
  ...rest,
  icon: Si[iconName] || null, // null if the icon doesn't exist, badge is used instead
}));