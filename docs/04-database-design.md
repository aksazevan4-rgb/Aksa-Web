# 04 — Database Design
## AKSA AboutMe

> Skema existing (`prisma/schema.prisma`, 626 baris — model `User`, `ProfileLink`, `AuditLog`, `PremiumPlan`, dst.) **dipertahankan sebagai fondasi**. Dokumen ini mendefinisikan model BARU yang perlu ditambahkan untuk memenuhi spek Badge System, Widget System, dan Marketplace, plus aturan evolusi skema ke depan.

---

## 1. Prinsip

1. **Tidak ada migrasi destruktif tanpa jalur rollback.** Setiap `prisma migrate` yang mengubah kolom wajib (not-null) di tabel besar (`User`, `ProfileLink`) wajib lewat tahap: tambah kolom nullable → backfill → baru diberi constraint.
2. **Soft delete untuk entitas yang bisa "dipulihkan"** (`ProfileLink`, `Media`, badge kustom) — kolom `deletedAt DateTime?`, bukan hard delete, kecuali untuk kepatuhan "Delete Account"/"Export Data" (dokumen 05).
3. **Audit log wajib** untuk mutasi yang menyentuh: role, plan, badge assignment, moderasi konten, penghapusan akun — semua sudah punya fondasi di model `AuditLog` + enum `AuditAction` existing, tinggal diperluas action barunya.

---

## 2. Model Baru yang Dibutuhkan

### 2.1 Badge System (mendukung dokumen 10)

```prisma
model Badge {
  id           String       @id @default(cuid())
  key          String       @unique          // "early-supporter", "verified", dst
  name         String
  description  String
  category     String                        // "staff" | "premium" | "achievement" | ...
  icon         String                        // nama ikon custom AKSA (bukan aset pihak ketiga)
  rarity       BadgeRarity  @default(COMMON)
  requirement  Json?                         // rule mesin: { type: "linkClicks", threshold: 1000 }
  isAnimated   Boolean      @default(false)
  isPurchasable Boolean     @default(false)
  priceCredits Int?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  userBadges   UserBadge[]

  @@index([category])
  @@map("badges")
}

model UserBadge {
  id          String    @id @default(cuid())
  userId      String
  badgeId     String
  progress    Int       @default(0)          // 0–100, dihitung job dokumen 03 §4
  unlockedAt  DateTime?
  equipped    Boolean   @default(false)
  featured    Boolean   @default(false)
  acquiredVia BadgeSource @default(SYSTEM)   // SYSTEM | PURCHASE | ADMIN_GRANT | EVENT

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge Badge @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeId])
  @@index([userId, equipped])
  @@map("user_badges")
}

enum BadgeRarity { COMMON RARE EPIC LEGENDARY LIMITED }
enum BadgeSource { SYSTEM PURCHASE ADMIN_GRANT EVENT }
```

### 2.2 Widget System (mendukung dokumen 09)

```prisma
model WidgetDefinition {
  id           String  @id @default(cuid())
  key          String  @unique      // "discord-presence", "spotify-now-playing", dst
  name         String
  category     String
  configSchema Json                 // JSON-schema untuk validasi config per instance
  isPremium    Boolean @default(false)

  instances WidgetInstance[]
  @@map("widget_definitions")
}

model WidgetInstance {
  id           String   @id @default(cuid())
  userId       String
  definitionId String
  order        Int      @default(0)
  enabled      Boolean  @default(true)
  config       Json                  // hasil isian sesuai configSchema induknya
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  definition WidgetDefinition @relation(fields: [definitionId], references: [id])

  @@index([userId, order])
  @@map("widget_instances")
}
```

> Catatan: `User.widgetConfig Json?` yang sudah ada tetap dipertahankan untuk kompatibilitas mundur selama masa transisi, lalu dimigrasi bertahap (job satu-kali) ke `WidgetInstance` sebelum akhirnya dihapus — bukan langsung dihapus di migrasi pertama (prinsip §1).

### 2.3 Marketplace (mendukung dokumen 13)

```prisma
model MarketplaceListing {
  id          String   @id @default(cuid())
  authorId    String
  type        ListingType             // THEME | TEMPLATE | WIDGET_PRESET | BADGE
  title       String
  description String
  priceCredits Int     @default(0)
  payload     Json                    // definisi tema/template terkait
  downloads   Int      @default(0)
  rating      Float?   @default(0)
  status      ListingStatus @default(PENDING)
  createdAt   DateTime @default(now())

  author  User @relation(fields: [authorId], references: [id])
  reviews MarketplaceReview[]

  @@index([type, status])
  @@map("marketplace_listings")
}

model MarketplaceReview {
  id        String @id @default(cuid())
  listingId String
  userId    String
  rating    Int
  comment   String?
  createdAt DateTime @default(now())

  listing MarketplaceListing @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@unique([listingId, userId])
  @@map("marketplace_reviews")
}

enum ListingType { THEME TEMPLATE WIDGET_PRESET BADGE }
enum ListingStatus { PENDING APPROVED REJECTED }
```

### 2.4 Analytics Rollup (mendukung dokumen 03 §10)

```prisma
model AnalyticsEvent {
  id        String   @id @default(cuid())
  userId    String
  type      String            // "profile_view" | "link_click" | "qr_scan" | "widget_interact"
  targetId  String?           // linkId/widgetId terkait
  meta      Json?
  createdAt DateTime @default(now())

  @@index([userId, type, createdAt])
  @@map("analytics_events")
}

model AnalyticsSummary {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime          // dibulatkan ke tengah malam UTC
  profileViews Int    @default(0)
  linkClicks   Int    @default(0)
  qrScans      Int    @default(0)

  @@unique([userId, date])
  @@map("analytics_summaries")
}
```

---

## 3. Relasi ke Model Existing

- `User.plan`, `User.premiumSince`, `User.premiumExpiresAt` (sudah ada) tetap jadi sumber kebenaran status premium — model baru di §2 hanya menambah, tidak menduplikasi field ini.
- `AuditLog` + `AuditAction` (existing, baris 559 & 598 di schema) diperluas dengan nilai enum baru: `BADGE_GRANT`, `BADGE_REVOKE`, `MARKETPLACE_APPROVE`, `MARKETPLACE_REJECT`, `WIDGET_CONFIG_CHANGE` — ditambahkan sebagai value baru di enum, bukan bikin tabel log terpisah.
- `ProfileTemplate` (existing) tetap dipakai untuk fitur Templates dashboard; `MarketplaceListing type=TEMPLATE` adalah lapisan distribusi/jual-beli di atasnya, bukan pengganti.

---

## 4. Indexing Strategy

- Semua foreign key kandidat query filter tinggi (`userId`, `status`, `category`) diberi `@@index` eksplisit — jangan mengandalkan index implisit dari relasi saja.
- Kolom yang dipakai untuk sorting umum (`order`, `createdAt`) disertakan dalam composite index bersama filter utamanya (lihat `@@index([userId, order])` di atas).
- Tidak menambahkan index spekulatif tanpa query nyata yang membutuhkannya (index berlebihan memperlambat write).

---

## 5. Normalisasi vs Denormalisasi

- Data relasional inti (User, Link, Badge, Widget) **dinormalisasi** penuh.
- Field agregat cepat-baca yang mahal dihitung ulang (`User.profileViews`, `AnalyticsSummary`) **didenormalisasi** secara sengaja, dengan mekanisme rebuild dari sumber mentah (`AnalyticsEvent`) jika terjadi drift — trade-off ini didokumentasikan di kode terkait, bukan diam-diam.

---

## 6. Migration Strategy

1. Tulis migrasi additive (kolom/tabel baru, nullable dulu).
2. Jalankan backfill script (`prisma/scripts/backfill-*.ts`) di staging.
3. Validasi data lewat query sanity check.
4. Baru terapkan constraint ketat (`NOT NULL`, unique) di migrasi berikutnya.
5. Hapus kolom lama (mis. `User.widgetConfig`) hanya setelah dipastikan tidak ada consumer yang membacanya lagi (audit code search wajib sebelum drop).

Setiap migrasi wajib disertai catatan di `CHANGELOG.md`/`CHANGELOG-N.md` (pola yang sudah ada di project) agar riwayat perubahan skema tetap tertelusuri.

---

## 7. Backup, Restore & Versioning

- Backup otomatis harian (dilakukan di level infrastruktur database — Postgres managed backup / `pg_dump` terjadwal), bukan lewat aplikasi.
- Fitur "Export Data" pengguna (dokumen 05/settings) adalah lapisan berbeda: query terscope ke satu user, hasil JSON yang bisa diunduh — tidak menyentuh mekanisme backup infra.
- Untuk tema/preset (Theme Builder dokumen 07), version history disimpan sebagai snapshot JSON di tabel terpisah (`ThemeVersion`) agar undo/redo tidak bergantung pada snapshot database penuh.

---

**Selanjutnya:** Dokumen **05 — Authentication System** (OAuth provider, 2FA, session/device management, security score).
