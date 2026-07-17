// Hardcoded content for Phase 1.
// Structured deliberately so each section maps 1:1 to a future Prisma model
// (Projects, Skills, Ecosystem, Stats...) — migration to DB later is a data-source swap, not a rewrite.

export const profile = {
  name: "Aksa Zevan",
  role: "Discord Bot Developer",
  roles: [
    "Discord Bot Developer",
    "Fullstack Developer",
    "System Architect",
    "Automation Engineer",
  ],
  founderOf: "AKSA.ID",
  location: "Indonesia",
  timezone: "UTC+7",
  status: "Sedang membangun",
  bio: [
    "Saya merancang sistem yang tetap hidup ketika tidak ada yang melihat — bot yang tersambung kembali setelah node mati, pipeline audio yang tidak tersendat saat ratusan pengguna mendengarkan bersamaan, dan layanan yang gagal dengan baik alih-alih gagal diam-diam.",
    "Sebagian besar pekerjaan ini tidak terlihat dari luar: reconnection logic, error boundary, antrian yang tahan terhadap restart. Itulah yang saya anggap penting.",
  ],
};

export const ecosystemNodes = [
  {
    id: "aksa-music",
    name: "Aksa Music",
    description: "Bot musik Discord berbasis Lavalink dengan sistem premium dan recovery otomatis.",
    status: "active" as const,
    statLabel: "Servers",
    statValue: "—",
  },
  {
    id: "aksa-id",
    name: "AKSA.ID",
    description: "Ekosistem digital untuk layanan, automation, dan komunitas.",
    status: "active" as const,
    statLabel: "Services",
    statValue: "—",
  },
  {
    id: "discord-automation",
    name: "Discord Automation",
    description: "Sistem moderasi, analytics, dan recovery custom untuk server komunitas.",
    status: "active" as const,
    statLabel: "Modules",
    statValue: "—",
  },
  {
    id: "community",
    name: "Community Projects",
    description: "Tools dan dukungan untuk komunitas developer.",
    status: "building" as const,
    statLabel: "Status",
    statValue: "Growing",
  },
  {
    id: "oss",
    name: "Open Source",
    description: "Kontribusi dan repo terbuka di GitHub.",
    status: "active" as const,
    statLabel: "Repos",
    statValue: "4",
  },
  {
    id: "future",
    name: "Future Products",
    description: "Yang sedang dirancang, belum diumumkan.",
    status: "planned" as const,
    statLabel: "Status",
    statValue: "Soon",
  },
];

export const projects = [
  {
    slug: "aksa-music",
    name: "Aksa Music",
    description:
      "Bot musik Discord dengan integrasi Lavalink/Shoukaku, sistem antrian persisten, dan layered error recovery untuk menjaga koneksi tetap hidup saat node eksternal gagal.",
    category: "Discord Bot",
    status: "Active",
    techStack: ["Node.js", "Discord.js", "Kazagumo", "Lavalink", "PostgreSQL"],
    links: { github: "#", live: "#" },
  },
  {
    slug: "aksa-id",
    name: "AKSA.ID",
    description:
      "Ekosistem digital yang menyatukan layanan, komunitas, dan automation di bawah satu identitas — dirancang untuk berkembang tanpa perlu dibangun ulang dari nol setiap kali ada produk baru.",
    category: "Platform",
    status: "Active",
    techStack: ["Node.js", "Discord.js", "MongoDB", "Mongoose"],
    links: { github: "#", live: "#" },
    discordInviteAKSAID: true,
  },
  {
    slug: "discord-automation",
    name: "Discord Automation Suite",
    description:
      "Kumpulan modul moderasi dan analytics yang dapat dipasang per-server, dengan audit log dan recovery state setelah restart. Sedang dikembangkan menuju server komunitas khusus.",
    category: "Automation",
    status: "Building",
    techStack: ["Node.js", "Discord.js", "Redis", "PostgreSQL"],
    links: { github: "#", live: "#" },
    discordInvite: true,
  },
];

export const techStack = [
  { name: "Node.js", category: "Runtime", level: "Advanced" },
  { name: "TypeScript", category: "Language", level: "Advanced" },
  { name: "Next.js", category: "Framework", level: "Intermediate" },
  { name: "React", category: "Framework", level: "Intermediate" },
  { name: "Discord.js", category: "Library", level: "Advanced" },
  { name: "Lavalink", category: "Infrastructure", level: "Advanced" },
  { name: "PostgreSQL", category: "Database", level: "Intermediate" },
  { name: "Prisma", category: "ORM", level: "Intermediate" },
  { name: "Redis", category: "Cache", level: "Intermediate" },
  { name: "Docker", category: "DevOps", level: "Intermediate" },
  { name: "Tailwind CSS", category: "Styling", level: "Advanced" },
  { name: "Git / GitHub Actions", category: "DevOps", level: "Advanced" },
];

export const stats = [
  { label: "Projects Shipped", value: 4 },
  { label: "Years Building", value: 2 },
  { label: "Commands Processed", value: 0, suffix: "+" },
  { label: "Discord Servers", value: 0, suffix: "+" },
];

export const focusItems = [
  {
    title: "Memperbaiki stabilitas Aksa Music",
    detail: "Menangani WebSocket timeout dari node Lavalink eksternal tanpa menjatuhkan proses utama.",
  },
  {
    title: "Membangun sistem yang scalable",
    detail: "Arsitektur yang tetap solid saat beban bertambah, bukan hanya saat demo.",
  },
  {
    title: "Eksplorasi teknologi baru",
    detail: "Terus belajar pola dan tools yang relevan untuk sistem terdistribusi.",
  },
];

export const links = {
  website: "aksa-lemon.vercel.app",
  discord: "discord.gg/S3Ga5RjUqT",
  AKSAID: "https://discord.gg/nNEFkUWYWT",
  github: "https://github.com/aksazevan4-rgb",
  youtube: "https://www.youtube.com/@Aksa_Zevan",
  tiktok: "https://www.tiktok.com/@aksa1104",
  instagram: "https://www.instagram.com/aksa_411/",
  saweria: "saweria.co/Aksazev",
  bagibagi:"bagibagi.co/Aksa_Zevan",
};
