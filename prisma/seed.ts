// Seed database dengan data awal untuk semua section homepage (Profile,
// Ecosystem, Projects, Tech Stack, Stats, Focus, Settings/social links,
// Services, Testimonials) supaya homepage tidak kosong di deploy pertama
// kali, sebelum admin mengisi konten asli lewat Dashboard > Konten Website.
//
// Jalankan dengan: npx prisma db seed
// (pastikan "prisma": { "seed": "tsx prisma/seed.ts" } sudah ada di package.json)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- Profile (singleton) ---
  await prisma.profile.upsert({
    where: { id: "profile" },
    update: {},
    create: {
      id: "profile",
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
      bioParagraphs: [
        "Saya merancang sistem yang tetap hidup ketika tidak ada yang melihat — bot yang tersambung kembali setelah node mati, pipeline audio yang tidak tersendat saat ratusan pengguna mendengarkan bersamaan, dan layanan yang gagal dengan baik alih-alih gagal diam-diam.",
        "Sebagian besar pekerjaan ini tidak terlihat dari luar: reconnection logic, error boundary, antrian yang tahan terhadap restart. Itulah yang saya anggap penting.",
      ],
    },
  });

  // --- Ecosystem nodes ---
  // Model EcosystemNode tidak punya unique key selain id, jadi bersihkan
  // dulu supaya re-run seed tidak menumpuk duplikat.
  await prisma.ecosystemNode.deleteMany({});
  const ecosystemNodes = [
    {
      name: "Aksa Music",
      description:
        "Bot musik Discord berbasis Lavalink dengan sistem premium dan recovery otomatis.",
      status: "active",
      order: 0,
    },
    {
      name: "AKSA.ID",
      description: "Ekosistem digital untuk layanan, automation, dan komunitas.",
      status: "active",
      order: 1,
    },
    {
      name: "Discord Automation",
      description:
        "Sistem moderasi, analytics, dan recovery custom untuk server komunitas.",
      status: "active",
      order: 2,
    },
    {
      name: "Community Projects",
      description: "Tools dan dukungan untuk komunitas developer.",
      status: "building",
      order: 3,
    },
    {
      name: "Open Source",
      description: "Kontribusi dan repo terbuka di GitHub.",
      status: "active",
      order: 4,
    },
    {
      name: "Future Products",
      description: "Yang sedang dirancang, belum diumumkan.",
      status: "planned",
      order: 5,
    },
  ];
  for (const node of ecosystemNodes) {
    await prisma.ecosystemNode.create({ data: node });
  }

  // --- Projects ---
  // Model Project tidak punya unique key selain id, jadi bersihkan dulu.
  await prisma.project.deleteMany({});
  const projects = [
    {
      title: "Aksa Music",
      description:
        "Bot musik Discord dengan integrasi Lavalink/Shoukaku, sistem antrian persisten, dan layered error recovery untuk menjaga koneksi tetap hidup saat node eksternal gagal.",
      tags: ["Node.js", "Discord.js", "Kazagumo", "Lavalink", "PostgreSQL"],
      status: "active",
      repoUrl: null,
      url: null,
      order: 0,
    },
    {
      title: "AKSA.ID",
      description:
        "Ekosistem digital yang menyatukan layanan, komunitas, dan automation di bawah satu identitas — dirancang untuk berkembang tanpa perlu dibangun ulang dari nol setiap kali ada produk baru.",
      tags: ["Next.js", "TypeScript", "Tailwind CSS"],
      status: "active",
      repoUrl: null,
      url: null,
      order: 1,
    },
    {
      title: "Discord Automation Suite",
      description:
        "Kumpulan modul moderasi dan analytics yang dapat dipasang per-server, dengan audit log dan recovery state setelah restart. Sedang dikembangkan menuju server komunitas khusus.",
      tags: ["Node.js", "Discord.js", "Redis", "PostgreSQL"],
      status: "building",
      repoUrl: null,
      url: "https://discord.gg/S3Ga5RjUqT",
      order: 2,
    },
  ];
  for (const project of projects) {
    await prisma.project.create({ data: project });
  }

  // --- Tech stack ---
  await prisma.techItem.deleteMany({});
  const techStack = [
    { name: "Node.js", category: "Runtime" },
    { name: "TypeScript", category: "Language" },
    { name: "Next.js", category: "Framework" },
    { name: "React", category: "Framework" },
    { name: "Discord.js", category: "Library" },
    { name: "Lavalink", category: "Infrastructure" },
    { name: "PostgreSQL", category: "Database" },
    { name: "Prisma", category: "ORM" },
    { name: "Redis", category: "Cache" },
    { name: "Docker", category: "DevOps" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "Git / GitHub Actions", category: "DevOps" },
  ];
  for (const [i, tech] of techStack.entries()) {
    await prisma.techItem.create({ data: { ...tech, order: i } });
  }

  // --- Stats ---
  // Stat tidak punya unique key selain id, jadi kita bersihkan dulu supaya
  // re-run seed tidak menumpuk duplikat.
  const stats = [
    { label: "Projects Shipped", value: "4" },
    { label: "Years Building", value: "2" },
    { label: "Commands Processed", value: "0+" },
    { label: "Discord Servers", value: "0+" },
  ];
  await prisma.stat.deleteMany({});
  for (const [i, stat] of stats.entries()) {
    await prisma.stat.create({ data: { ...stat, order: i } });
  }

  // --- Focus items ---
  const focusItems = [
    {
      title: "Memperbaiki stabilitas Aksa Music",
      description:
        "Menangani WebSocket timeout dari node Lavalink eksternal tanpa menjatuhkan proses utama.",
    },
    {
      title: "Membangun sistem yang scalable",
      description:
        "Arsitektur yang tetap solid saat beban bertambah, bukan hanya saat demo.",
    },
    {
      title: "Eksplorasi teknologi baru",
      description:
        "Terus belajar pola dan tools yang relevan untuk sistem terdistribusi.",
    },
  ];
  await prisma.focusItem.deleteMany({});
  for (const [i, item] of focusItems.entries()) {
    await prisma.focusItem.create({ data: { ...item, order: i } });
  }

  // --- Settings (singleton, menyimpan social links) ---
  await prisma.settings.upsert({
    where: { id: "settings" },
    update: {
      socialGithub: "https://github.com/aksazevan4-rgb",
      socialDiscord: "https://discord.gg/S3Ga5RjUqT",
      socialWebsite: "https://aksa-lemon.vercel.app",
      socialSaweria: "https://saweria.co/Aksazev",
    },
    create: {
      id: "settings",
      siteTitle: "Aksa Zevan — Discord Bot Developer & System Architect",
      siteDescription:
        "Membangun bot Discord, sistem otomatisasi, dan ekosistem digital yang fokus pada performa, stabilitas, dan pengalaman pengguna.",
      socialGithub: "https://github.com/aksazevan4-rgb",
      socialDiscord: "https://discord.gg/S3Ga5RjUqT",
      socialWebsite: "https://aksa-lemon.vercel.app",
      socialSaweria: "https://saweria.co/Aksazev",
    },
  });

  // --- Services ---
  const services = [
    {
      title: "Pembuatan Bot Discord",
      description:
        "Bot custom untuk moderasi, musik, automation, atau kebutuhan komunitas spesifik — dirancang untuk tetap stabil saat beban bertambah.",
      order: 0,
    },
    {
      title: "Sistem Automation",
      description:
        "Pipeline otomatisasi untuk workflow berulang: notifikasi, sinkronisasi data, integrasi antar layanan.",
      order: 1,
    },
    {
      title: "Konsultasi Arsitektur Sistem",
      description:
        "Review dan saran desain sistem untuk aplikasi yang perlu scalable dan tahan terhadap kegagalan parsial.",
      order: 2,
    },
  ];
  await prisma.service.deleteMany({});
  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  // --- Testimonials ---
  const testimonials = [
    {
      name: "Owner Server Discord",
      role: "Komunitas Gaming",
      content:
        "Bot musiknya stabil banget, jarang disconnect walau server lagi penuh. Responsif juga kalau ada request fitur baru.",
      order: 0,
    },
    {
      name: "Klien Automation",
      role: "Pemilik Bisnis Online",
      content:
        "Sistem automation yang dibuat benar-benar menghemat waktu tim kami. Komunikasinya juga jelas dari awal sampai selesai.",
      order: 1,
    },
  ];
  await prisma.testimonial.deleteMany({});
  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial });
  }

  console.log("Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
