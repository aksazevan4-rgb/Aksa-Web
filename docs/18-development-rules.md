# 18 — Development Rules
## AKSA AboutMe

> Dokumen paling penting — mengikat semua dokumen 00–17. Setiap perubahan kode pada project ini, oleh siapa pun (termasuk AI), wajib patuh pada aturan berikut tanpa pengecualian.

---

## 1. Larangan Mutlak

Jangan pernah membuat:

- Duplicate component — cek dulu `shared/components/ui/` (dokumen 02 §9) dan komponen fitur terkait sebelum membuat baru.
- Duplicate function/utility — cek `shared/lib/`.
- Duplicate type — cek `shared/types/` dan `features/{domain}/types.ts`.
- Duplicate API/route — cek `app/api/` dan konvensi Server Action (dokumen 02 §4) sebelum menambah endpoint baru.
- Duplicate Prisma Model — cek `prisma/schema.prisma` penuh (dokumen 04) sebelum menambah model; perluas model existing jika secara konsep sama.
- Duplicate hook — cek `shared/hooks/` dan `features/{domain}/hooks/`.
- Duplicate validation schema — cek `shared/validation/` dan `features/{domain}/validation.ts` (dokumen 03 §7).

---

## 2. Selalu Dilakukan

- **Reuse component** sebelum membuat baru — jika komponen serupa tapi sedikit beda, tambahkan prop/varian, jangan fork jadi file baru.
- **Feature-based architecture** (dokumen 02) — kode baru masuk ke `features/{domain}/`, bukan folder generik.
- **Reusable hooks/utilities/types/validation** — ekstrak ke `shared/` begitu dipakai lebih dari satu fitur.
- **Strongly typed** — hindari `any`; tipe berasal dari Prisma Client generated types + Zod `infer`, bukan didefinisikan ulang manual yang bisa drift dari schema.

---

## 3. Kualitas Kode Wajib

Setiap perubahan harus:

- Lolos `npm run lint` (ESLint clean).
- Lolos `tsc --noEmit` (nol TypeScript error).
- Lolos `prisma validate` + `prisma generate` (skema konsisten dengan client).
- Lolos `next build` (nol build error, nol hydration warning yang belum ditangani).
- Responsive di semua breakpoint (dokumen 01 §11).
- Accessible (dokumen 01 §13, dokumen 16 §8).

Perintah tunggal yang merangkum semua ini sudah ada di `package.json` existing: `npm run check`.

---

## 4. Larangan Menghapus Fitur

- Fitur lama **tidak boleh dihapus** tanpa alasan eksplisit yang didokumentasikan.
- Jika sebuah fitur digantikan arsitektur baru (mis. `User.widgetConfig` → `WidgetInstance`, dokumen 04 §2.2), fitur lama dipertahankan berjalan paralel selama masa transisi, dihapus hanya setelah dipastikan tidak ada consumer aktif.

---

## 5. Proses Refactor yang Aman

Setiap refactor wajib disertai:

1. **Alasan** — masalah konkret apa yang diselesaikan refactor ini (bukan "biar lebih rapi" tanpa spesifik).
2. **Dependency yang terdampak** — daftar file/fitur lain yang memanggil kode yang direfactor.
3. **Jaminan tanpa breaking change** — jika terpaksa ada breaking change (mis. ubah signature Server Action yang dipakai banyak tempat), semua pemanggil diupdate dalam PR yang sama, bukan dibiarkan pecah untuk "diperbaiki nanti".

---

## 6. Larangan Kualitas (Zero Tolerance)

Tidak boleh ada, di setiap PR yang masuk `main`:

- TypeScript Error
- Prisma Error
- Runtime Error
- Build Error
- ESLint Error
- Hydration Error
- Memory Leak (event listener/subscription tidak di-cleanup di `useEffect`)
- Duplicate Code (lihat §1)
- Dead Code (import/fungsi yang tidak pernah dipanggil)
- Circular Dependency (modul A impor B yang impor A)
- Unused Import
- Unused Variable

Kategori ini ditegakkan otomatis lewat CI (dokumen 17 §5) — bukan mengandalkan review manual saja.

---

## 7. Dokumentasi Berjalan

- Perubahan skema database dicatat di `CHANGELOG.md`/`CHANGELOG-N.md` (pola existing di project).
- Perubahan besar arsitektur (penambahan fitur module baru) memicu update ke dokumen master terkait (00–17) — dokumen ini adalah living document, bukan artefak sekali tulis lalu dilupakan.

---

## 8. Prioritas Saat Konflik Aturan

Jika ada dua aturan yang tampak bertentangan (mis. kecepatan rilis vs kelengkapan test), urutan prioritas:

1. Keamanan pengguna (data, privasi, integritas akun) — tidak bisa dikompromikan.
2. Stabilitas produksi (nol build/runtime error) — tidak bisa dikompromikan.
3. Konsistensi desain & arsitektur (dokumen 01–02) — dipertahankan kecuali ada alasan kuat mendokumentasikan pengecualian.
4. Kecepatan pengembangan fitur baru — dioptimalkan selama tidak melanggar 1–3.

---

## Penutup Master Project

Dengan selesainya dokumen 00–18, seluruh **AKSA AboutMe Master Project** — dari visi, desain, arsitektur frontend/backend, database, auth, dashboard, kustomisasi profil, link management, widget, badge, public profile, premium, marketplace, admin panel, API, performa/keamanan, testing/deployment, hingga aturan pengembangan — sudah terdokumentasi lengkap dan saling konsisten satu sama lain, siap dijadikan acuan implementasi bertahap tanpa kehilangan satu pun fitur dari codebase existing.
