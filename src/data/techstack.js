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
];

export const techstack = tech.map(({ iconName, ...rest }) => ({
  ...rest,
  icon: Si[iconName] || null, // null if the icon doesn't exist, badge is used instead
}));