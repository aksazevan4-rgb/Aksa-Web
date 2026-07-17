/**
 * prisma/migrations-guide.md
 *
 * Panduan tambahan model yang masih perlu ditambahkan ke schema.prisma
 * untuk mengaktifkan sisa fitur Phase 3.
 *
 * ✅ ProfileViewLog — SUDAH ditambahkan ke schema.prisma (lihat model
 *    ProfileViewLog di dekat ProfileLink). Dipakai oleh lib/profile-views.ts.
 *    Setelah pull perubahan ini, jalankan:
 *      npx prisma db push
 *      npx prisma generate
 *
 * 🔲 DiscordBotConfig — BELUM ditambahkan. Model ini untuk menyimpan
 *    konfigurasi bot (token, secret, on/off) dari Admin Dashboard alih-alih
 *    hardcode di .env, supaya admin bisa aktif/nonaktifkan bot tanpa deploy
 *    ulang. Belum dibutuhkan sekarang karena discord-bot/index.ts masih
 *    berupa scaffold (client discord.js-nya masih di-comment, belum jalan
 *    sebagai proses nyata). Tambahkan saat siap mengaktifkan Phase 3 secara
 *    penuh.
 */

// ── Tambahkan di schema.prisma saat siap ────────────────────────────────────

// model DiscordBotConfig {
//   id           String  @id @default("discord-bot")
//   enabled      Boolean @default(false)
//   botToken     String? // encrypted in production
//   clientId     String?
//   clientSecret String? // encrypted in production
//   webhookSecret String?
//   updatedAt    DateTime @updatedAt
//   @@map("discord_bot_config")
// }
