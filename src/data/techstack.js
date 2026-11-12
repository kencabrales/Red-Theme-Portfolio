import * as Si from "react-icons/si";

const groups = [
  {
    id: "languages",
    title: "Languages & Markup",
    items: [
      { name: "C", iconName: "SiC", color: "#A8B9CC", badge: "C" },
      { name: "C#", iconName: "SiCsharp", color: "#239120", badge: "C#" },
      { name: "Java", iconName: "SiJava", color: "#ED8B00", badge: "Ja" },
      { name: "JavaScript", iconName: "SiJavascript", color: "#F7DF1E", badge: "JS" },
      { name: "Dart", iconName: "SiDart", color: "#0175C2", badge: "Dt" },
      { name: "HTML", iconName: "SiHtml5", color: "#E34F26", badge: "H" },
      { name: "CSS", iconName: "SiCss3", color: "#1572B6", badge: "C" },
    ],
  },
  {
    id: "frameworks",
    title: "Frameworks & Development",
    items: [
      { name: "ReactJS", iconName: "SiReact", color: "#61DAFB", badge: "Re" },
      { name: "Vite", iconName: "SiVite", color: "#A78BFA", badge: "Vi" },
      { name: "Node JS", iconName: "SiNodedotjs", color: "#68A063", badge: "No" },
      { name: "Bootstrap", iconName: "SiBootstrap", color: "#7952B3", badge: "B" },
      { name: "Tailwind CSS", iconName: "SiTailwindcss", color: "#38BDF8", badge: "Tw" },
      { name: "Material UI", iconName: "SiMui", color: "#007FFF", badge: "M" },
      { name: "Flutter", iconName: "SiFlutter", color: "#02569B", badge: "Fl" },
    ],
  },
  {
    id: "databases",
    title: "Databases & Services",
    items: [
      { name: "Firebase", iconName: "SiFirebase", color: "#FFCA28", badge: "Fb" },
      { name: "MongoDB", iconName: "SiMongodb", color: "#47A248", badge: "Mo" },
      { name: "SQL", iconName: "SiMysql", color: "#4479A1", badge: "SQL" },
    ],
  },
  {
    id: "tools",
    title: "Tools & Deployment",
    items: [
      { name: "VS Code", iconName: "SiVisualstudiocode", color: "#007ACC", badge: "VS" },
      { name: "Git", iconName: "SiGit", color: "#F05032", badge: "Git" },
      { name: "GitHub", iconName: "SiGithub", color: "#FFFFFF", badge: "GH" },
      { name: "Vercel", iconName: "SiVercel", color: "#FFFFFF", badge: "V" },
    ],
  },
  {
    id: "creative",
    title: "Creative & Productivity Software",
    items: [
      { name: "Canva", iconName: "SiCanva", color: "#00C4CC", badge: "Ca" },
      { name: "Photoshop", iconName: "SiAdobephotoshop", color: "#31A8FF", badge: "Ps" },
      { name: "Figma", iconName: "SiFigma", color: "#F24E1E", badge: "Fi" },
      { name: "Blender", iconName: "SiBlender", color: "#F5792A", badge: "Bl" },
      { name: "CapCut", iconName: null, color: "#FFFFFF", badge: "Cc" },
      { name: "Microsoft Word", iconName: null, color: "#2B579A", badge: "Wd" },
      { name: "Excel", iconName: null, color: "#217346", badge: "Xl" },
      { name: "PowerPoint", iconName: null, color: "#B7472A", badge: "PP" },
    ],
  },
];

export const techstackGroups = groups.map(({ items, ...group }) => ({
  ...group,
  items: items.map(({ iconName, ...item }) => ({
    ...item,
    icon: iconName ? Si[iconName] || null : null,
  })),
}));

// Keep a flat export available for any other component that may need it.
export const techstack = techstackGroups.flatMap((group) => group.items);
