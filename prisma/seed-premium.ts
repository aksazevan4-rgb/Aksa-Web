// Seed script for the new database-driven Premium system + SiteConfig.
//
// Run this AFTER applying the schema migration that adds PremiumPlan,
// PremiumFeature, PremiumPlanFeature, and SiteConfig models.
//
// Usage: npx tsx prisma/seed-premium.ts
//
// This is intentionally separate from prisma/seed.ts (which seeds the
// homepage CMS content) to avoid touching unrelated data on re-runs.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Premium system + SiteConfig...");

  // ── Site Config ─────────────────────────────────────────────────────────
  await prisma.siteConfig.upsert({
    where: { id: "config" },
    update: {},
    create: {
      id: "config",
      siteName: "AKSA",
      siteUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://aksa.example.com",
      siteTitle: "AKSA — Build Your Premium Profile",
      siteDescription:
        "Buat halaman profil premium dengan integrasi Discord real-time, tema kustomisasi penuh, dan widget yang benar-benar berguna.",
      allowRegistration: true,
      maintenanceMode: false,
      poweredByVisible: true,
      showAksaIdShowcase: true,
      aksaIdDiscordUrl: null,
      aksaIdDescription:
        "Platform layanan digital yang bergerak di bidang jasa Discord, penjualan aplikasi premium, dan suntik media sosial. Seluruh transaksi dan layanan dikelola eksklusif melalui komunitas Discord.",
    },
  });

  // ── Premium Features ─────────────────────────────────────────────────────
  const features = [
    // Profile appearance
    { key: "custom_background_color", label: "Custom Background Color", category: "Tampilan Profil" },
    { key: "custom_background_gradient", label: "Custom Background Gradient", category: "Tampilan Profil" },
    { key: "custom_background_image", label: "Custom Background Image", category: "Tampilan Profil" },
    { key: "custom_background_video", label: "Custom Background Video", category: "Tampilan Profil" },
    { key: "custom_background_animated", label: "Animated Background", category: "Tampilan Profil" },
    { key: "custom_background_aurora", label: "Background: Aurora", category: "Tampilan Profil" },
    { key: "custom_background_mesh", label: "Background: Mesh Gradient", category: "Tampilan Profil" },
    { key: "custom_background_galaxy", label: "Background: Galaxy", category: "Tampilan Profil" },
    { key: "custom_background_particles", label: "Background: Particles", category: "Tampilan Profil" },
    { key: "custom_background_neon", label: "Background: Neon", category: "Tampilan Profil" },
    { key: "layout_classic", label: "Layout: Classic", category: "Layout" },
    { key: "layout_modern", label: "Layout: Modern", category: "Layout" },
    { key: "layout_glass", label: "Layout: Glass", category: "Layout" },
    { key: "layout_minimal", label: "Layout: Minimal", category: "Layout" },
    { key: "layout_compact", label: "Layout: Compact", category: "Layout" },
    { key: "layout_fullwidth", label: "Layout: Full Width", category: "Layout" },
    { key: "layout_creator", label: "Layout: Creator", category: "Layout" },
    { key: "layout_cyber", label: "Layout: Cyber", category: "Layout" },
    { key: "layout_neon", label: "Layout: Neon", category: "Layout" },
    { key: "border_glow", label: "Border: Glow", category: "Tampilan Profil" },
    { key: "border_neon", label: "Border: Neon", category: "Tampilan Profil" },
    { key: "border_animated", label: "Border: Animated", category: "Tampilan Profil" },
    { key: "border_rainbow", label: "Border: Rainbow", category: "Tampilan Profil" },
    { key: "border_cyber", label: "Border: Cyber", category: "Tampilan Profil" },
    { key: "border_glass", label: "Border: Glass", category: "Tampilan Profil" },
    { key: "border_dashed", label: "Border: Dashed", category: "Tampilan Profil" },
    { key: "border_dotted", label: "Border: Dotted", category: "Tampilan Profil" },
    { key: "border_double", label: "Border: Double", category: "Tampilan Profil" },
    { key: "border_gradient", label: "Border: Gradient", category: "Tampilan Profil" },
    { key: "border_premium", label: "Border: Premium", category: "Tampilan Profil" },
    { key: "custom_font", label: "Custom Font", category: "Tampilan Profil" },
    { key: "custom_accent_color", label: "Custom Accent Color", category: "Tampilan Profil" },

    // Widgets
    { key: "widget_about", label: "Widget: About Me", category: "Widget" },
    { key: "widget_status", label: "Widget: Status", category: "Widget" },
    { key: "widget_social", label: "Widget: Social Links", category: "Widget" },
    { key: "widget_discord", label: "Widget: Discord Presence", category: "Widget" },
    { key: "widget_discord_activity", label: "Widget: Discord Activity", category: "Widget" },
    { key: "widget_spotify", label: "Widget: Spotify Now Playing", category: "Widget" },
    { key: "widget_skills", label: "Widget: Skills", category: "Widget" },
    { key: "widget_projects", label: "Widget: Projects", category: "Widget" },
    { key: "widget_gallery", label: "Widget: Gallery", category: "Widget" },
    { key: "widget_visitor_count", label: "Widget: Visitor Count", category: "Widget" },
    { key: "widget_testimonials", label: "Widget: Testimonials", category: "Widget" },
    { key: "widget_contact", label: "Widget: Contact", category: "Widget" },
    { key: "widget_donate", label: "Widget: Donate", category: "Widget" },
    { key: "widget_timeline", label: "Widget: Timeline", category: "Widget" },
    { key: "widget_achievement", label: "Widget: Achievement", category: "Widget" },
    { key: "widget_faq", label: "Widget: FAQ", category: "Widget" },
    { key: "widget_embed", label: "Widget: Embed", category: "Widget" },
    { key: "widget_custom_html", label: "Widget: Custom HTML", category: "Widget" },
    { key: "widget_guestbook", label: "Widget: Guestbook", category: "Widget" },
    { key: "widget_reactions", label: "Widget: Reactions", category: "Widget" },
    { key: "widget_statistics", label: "Widget: Statistics", category: "Widget" },
    { key: "widget_github_graph", label: "Widget: GitHub Contribution", category: "Widget" },
    { key: "widget_crypto_ticker", label: "Widget: Crypto Ticker", category: "Widget" },
    { key: "widget_rss_feed", label: "Widget: RSS Feed", category: "Widget" },

    // Links
    { key: "links_unlimited", label: "Unlimited Link Buttons", category: "Links" },
    { key: "links_custom_icon", label: "Custom Link Icons", category: "Links" },

    // Analytics
    { key: "analytics_basic", label: "Basic Analytics", category: "Analitik" },
    { key: "analytics_advanced", label: "Advanced Analytics (grafik harian)", category: "Analitik" },

    // Platform
    { key: "remove_powered_by", label: 'Hapus "Powered by AKSA"', category: "Platform" },
    { key: "custom_domain", label: "Custom Domain", category: "Platform" },
    { key: "custom_css", label: "Custom CSS", category: "Platform" },
    { key: "priority_support", label: "Priority Support", category: "Platform" },
  ];

  for (const f of features) {
    await prisma.premiumFeature.upsert({
      where: { key: f.key },
      update: { label: f.label, category: f.category },
      create: f,
    });
  }

  // ── Premium Plans ─────────────────────────────────────────────────────────
  const freePlan = await prisma.premiumPlan.upsert({
    where: { name: "FREE" },
    update: {},
    create: { name: "FREE", label: "Free", price: 0, sortOrder: 0 },
  });

  const premiumPlan = await prisma.premiumPlan.upsert({
    where: { name: "PREMIUM" },
    update: {},
    create: { name: "PREMIUM", label: "Premium", price: 29000, sortOrder: 1 },
  });

  // FREE plan feature set
  const freeFeatureKeys = [
    "custom_background_color",
    "custom_background_gradient",
    "custom_background_image",
    "layout_classic",
    "layout_modern",
    "layout_minimal",
    "widget_about",
    "widget_status",
    "widget_social",
    "widget_discord",
    "analytics_basic",
  ];

  // PREMIUM plan = everything
  const premiumFeatureKeys = features.map((f) => f.key);

  const allFeatures = await prisma.premiumFeature.findMany();
  const featureByKey = new Map(allFeatures.map((f) => [f.key, f.id]));

  for (const key of freeFeatureKeys) {
    const featureId = featureByKey.get(key);
    if (!featureId) continue;
    await prisma.premiumPlanFeature.upsert({
      where: { planId_featureId: { planId: freePlan.id, featureId } },
      update: {},
      create: { planId: freePlan.id, featureId },
    });
  }

  for (const key of premiumFeatureKeys) {
    const featureId = featureByKey.get(key);
    if (!featureId) continue;
    await prisma.premiumPlanFeature.upsert({
      where: { planId_featureId: { planId: premiumPlan.id, featureId } },
      update: {},
      create: { planId: premiumPlan.id, featureId },
    });
  }

  console.log("Premium system + SiteConfig seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
