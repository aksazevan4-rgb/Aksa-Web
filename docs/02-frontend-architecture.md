# 02 — Frontend Architecture
## AKSA AboutMe

> Arsitektur ini menggantikan struktur ad-hoc pada codebase existing (`app/`, `components/` datar) dengan pola **feature-based** yang scalable, tanpa menghapus rute atau fitur yang sudah berjalan (`app/[username]`, `app/dashboard/*`, `app/api/*` tetap dipertahankan sebagai App Router entrypoint — logic-nya yang direfaktor ke dalam struktur feature).

---

## 1. Prinsip Arsitektur

1. **App Router tetap jadi lapisan routing tipis** — halaman di `app/` hanya menyusun layout & memanggil feature modules, tidak berisi logic bisnis.
2. **Feature-based, bukan type-based** — `features/links/`, bukan `components/`, `hooks/`, `utils/` dipisah per tipe file global.
3. **Reuse wajib** — sebelum bikin komponen/hook baru, cek `shared/` dan feature lain. Duplikasi dilarang keras (dokumen 18).
4. **Server-first** — Server Components jadi default; Client Components (`"use client"`) hanya untuk interaktivitas yang benar-benar butuh (form, drag-drop, live preview, animasi).

---

## 2. Struktur Folder Target

```
app/                          # Routing tipis (Next.js App Router) — TETAP ADA
├── (public)/[username]/      # Profil publik
├── (auth)/login, register/   # Auth pages
├── dashboard/                # Layout dashboard + route per fitur
│   ├── links/page.tsx        # Import dari features/links
│   ├── appearance/page.tsx   # Import dari features/appearance
│   ├── widgets/page.tsx      # Import dari features/widgets
│   ├── badges/page.tsx       # Import dari features/badges
│   └── ...
└── api/                      # Route handlers tipis, delegasi ke features/*/server

features/                     # BARU — inti arsitektur
├── links/
│   ├── components/           # LinkCard, LinkForm, IconPicker, dst
│   ├── server/                # server actions + queries khusus links
│   ├── hooks/                 # useLinkDragReorder, dll
│   ├── types.ts
│   └── validation.ts          # Zod schema link
├── appearance/
├── widgets/
├── badges/
├── premium/
├── auth/
├── admin/
└── analytics/

shared/                        # Reusable lintas fitur
├── components/ui/             # Button, Input, Modal, Toast, Skeleton (design system §01)
├── hooks/                     # useDebounce, useMediaQuery, useCommandPalette
├── lib/                       # prisma client singleton, redis client, cn() utility
├── types/                     # tipe global (User, Session, dst)
└── validation/                # Zod schema yang dipakai >1 fitur

providers/                     # ThemeProvider, SessionProvider, QueryProvider, ToastProvider
```

**Migrasi bertahap:** file existing seperti `components/dashboard/Sidebar.tsx`, `components/dashboard/CommandPalette.tsx` dipindah ke `shared/components/` (dipakai lintas fitur), sedangkan komponen spesifik satu domain (mis. `AppearanceClient.tsx`, `ProfileLinksClient.tsx`) dipindah ke `features/appearance/components/` dan `features/links/components/` masing-masing.

---

## 3. State Management

| Jenis State | Solusi |
|---|---|
| Server state (data dari DB) | Server Components + Server Actions, di-cache via Next.js `revalidateTag`/`revalidatePath` |
| Client cache untuk data yang sering di-refetch (analytics live, notification count) | React Query (`@tanstack/react-query`) — ditambahkan sebagai dependency baru |
| UI state lokal (modal open, tab aktif) | `useState`/`useReducer` di komponen terkait, tidak di-global-kan tanpa alasan |
| State lintas komponen jauh (theme builder draft, command palette open) | React Context per fitur (`AppearanceDraftContext`, `CommandPaletteContext`) — bukan satu context raksasa global |
| Form state | React Hook Form + Zod resolver (konsisten di semua form, ganti pola form manual yang ada di `ProfileForm.tsx` dkk) |

**Aturan:** tidak ada state management library tambahan (Redux/Zustand/Jotai) kecuali kebutuhan terbukti melebihi kapasitas Context+React Query — dievaluasi ulang saat implementasi, bukan diputuskan spekulatif di sini.

---

## 4. Server Actions Convention

Setiap feature module punya `server/actions.ts` dengan pola konsisten:

```ts
"use server";

export async function updateLinkAction(input: UpdateLinkInput) {
  const session = await requireSession();               // shared/lib/auth
  const parsed = updateLinkSchema.parse(input);          // Zod validation wajib
  await requirePermission(session, "links:update");      // RBAC (dokumen 03)
  const result = await linkRepository.update(parsed);    // repository layer, bukan prisma langsung di action
  revalidatePath(`/${session.user.username}`);
  return { success: true, data: result };
}
```

**Aturan wajib:**
- Semua Server Action tervalidasi Zod di titik masuk (tidak percaya input client mentah).
- Tidak ada akses Prisma langsung di komponen; selalu lewat repository/service layer (dokumen 03–04).
- Return type konsisten: `{ success: boolean, data?: T, error?: string }` — dipakai seragam agar penanganan error di client predictable.

---

## 5. Data Fetching & Caching

- Server Components memakai `fetch`/Prisma langsung dengan Next.js cache tags per resource (`link:{id}`, `profile:{username}`).
- Redis dipakai untuk data yang mahal dihitung ulang tapi sering diakses: leaderboard, badge progress agregat, analytics ringkasan harian (detail di dokumen 03).
- Client-side, React Query dipakai untuk data yang butuh polling/refresh tanpa reload (notification bell, online status, live view counter).

---

## 6. Code Splitting & Lazy Loading

- Modal berat (Theme Builder full editor, Widget Builder, QR Code generator) di-`dynamic()` import dengan `ssr: false` dan skeleton loading dari §10 dokumen 01.
- Panel dashboard yang jarang dibuka (Admin Panel, Marketplace) memakai route-level code splitting bawaan App Router (otomatis per-page).
- Library berat (Framer Motion timeline editor, QR generator, chart library) diimport dinamis hanya di halaman yang membutuhkan, bukan di root layout.

---

## 7. Error Handling & Boundaries

- Setiap segment route punya `error.tsx` dan `not-found.tsx` sendiri (memakai state Error dari dokumen 01 §10), bukan mengandalkan error boundary global saja.
- `loading.tsx` per segment memakai skeleton spesifik fitur (bukan spinner generik).
- Client Components interaktif kompleks (Theme Builder, Widget Builder) dibungkus `<ErrorBoundary>` lokal di `shared/components/ErrorBoundary.tsx` agar kegagalan satu widget tidak menjatuhkan seluruh dashboard.

---

## 8. Suspense & Streaming

- Halaman dashboard dengan banyak data (Overview, Analytics) memecah query jadi beberapa `<Suspense>` boundary independen, sehingga header/sidebar tampil instan sementara widget statistik streaming belakangan.
- Public profile (`app/[username]/page.tsx`) memprioritaskan render konten inti (nama, avatar, links) lebih dulu, lalu widget berat (Discord presence, Spotify presence) di-stream menyusul dalam Suspense terpisah agar Largest Contentful Paint tidak tertahan oleh integrasi eksternal.

---

## 9. Reusable Component Inventory (Baseline — dikembangkan di dokumen 06)

`shared/components/ui/` minimal berisi: `Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Switch`, `Checkbox`, `RadioGroup`, `Modal`, `Drawer`, `Popover`, `Tooltip`, `Toast`/`Toaster`, `Skeleton`, `EmptyState`, `ErrorState`, `Card`, `Badge` (UI badge, bukan game badge), `Avatar`, `Tabs`, `Accordion`, `CommandPalette`, `DataTable`.

Setiap komponen baru **wajib dicek dulu di daftar ini** sebelum dibuat ulang — sesuai larangan duplicate component di dokumen 18.

---

## 10. Design Tokens Implementation

Token dari dokumen 01 diimplementasikan sebagai:
1. CSS variables di `app/globals.css` (sumber kebenaran runtime, mendukung theming dinamis per-user).
2. `tailwind.config` (via Tailwind v4 `@theme`) yang mereferensikan CSS variables yang sama — bukan duplikasi nilai.

Ini memastikan tema kustom buatan pengguna (dokumen 07) bisa mengubah CSS variables di runtime tanpa rebuild, sementara Tailwind utility classes tetap konsisten dengan token yang sama.

---

**Selanjutnya:** Dokumen **03 — Backend Architecture** (Server Actions lanjutan, Redis caching, background jobs, rate limiting, RBAC).
