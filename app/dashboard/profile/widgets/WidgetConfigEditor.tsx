"use client";

import { useState, useTransition } from "react";
import {
  Award,
  Briefcase,
  CheckCircle2,
  Clock,
  Code2,
  Heart,
  HelpCircle,
  ImageIcon,
  Loader2,
  Plus,
  Quote,
  Trash2,
  Zap,
} from "lucide-react";
import { saveWidgetContent } from "./actions";

export interface StoredWidgetConfig {
  status?: { config?: { text?: string } };
  skills?: { config?: { items?: SkillItem[] } };
  projects?: { config?: { items?: ProjectItem[] } };
  testimonials?: { config?: { items?: TestimonialItem[] } };
  donate?: { config?: { links?: DonateLink[] } };
  gallery?: { config?: { items?: GalleryImage[] } };
  timeline?: { config?: { items?: TimelineItem[] } };
  achievement?: { config?: { items?: AchievementItem[] } };
  faq?: { config?: { items?: FaqItem[] } };
  embed?: { config?: { items?: EmbedItem[] } };
  "custom-html"?: { config?: { html?: string } };
  countdown?: { config?: { label?: string; targetDate?: string } };
  clock?: { config?: { timezone?: string } };
  "github-graph"?: { config?: { username?: string } };
  "rss-feed"?: { config?: { feedUrl?: string } };
  "crypto-ticker"?: { config?: { symbols?: string[] } };
}

interface Props {
  widgetConfig: StoredWidgetConfig | null;
  accessibleFeatures: string[];
}

const inputClass =
  "w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors";

export function WidgetConfigEditor({ widgetConfig, accessibleFeatures }: Props) {
  const hasSkills = accessibleFeatures.includes("widget_skills");
  const hasProjects = accessibleFeatures.includes("widget_projects");
  const hasTestimonials = accessibleFeatures.includes("widget_testimonials");
  const hasDonate = accessibleFeatures.includes("widget_donate");
  const hasGallery = accessibleFeatures.includes("widget_gallery");
  const hasTimeline = accessibleFeatures.includes("widget_timeline");
  const hasAchievement = accessibleFeatures.includes("widget_achievement");
  const hasFaq = accessibleFeatures.includes("widget_faq");
  const hasEmbed = accessibleFeatures.includes("widget_embed");
  const hasCustomHtml = accessibleFeatures.includes("widget_custom_html");
  const hasGithubGraph = accessibleFeatures.includes("widget_github_graph");
  const hasRssFeed = accessibleFeatures.includes("widget_rss_feed");
  const hasCryptoTicker = accessibleFeatures.includes("widget_crypto_ticker");

  return (
    <div className="columns-1 lg:columns-2 gap-5 [&>*]:mb-5 [&>*]:break-inside-avoid">
      {/* Status widget */}
      <StatusEditor
        initial={widgetConfig?.status?.config?.text ?? ""}
      />

      {/* Skills widget */}
      {hasSkills ? (
        <SkillsEditor
          initial={widgetConfig?.skills?.config?.items ?? []}
        />
      ) : null}

      {/* Projects widget */}
      {hasProjects ? (
        <ProjectsEditor
          initial={widgetConfig?.projects?.config?.items ?? []}
        />
      ) : null}

      {/* Testimonials widget */}
      {hasTestimonials ? (
        <TestimonialsEditor
          initial={widgetConfig?.testimonials?.config?.items ?? []}
        />
      ) : null}

      {/* Donate widget */}
      {hasDonate ? (
        <DonateEditor
          initial={widgetConfig?.donate?.config?.links ?? []}
        />
      ) : null}

      {/* Gallery widget */}
      {hasGallery ? (
        <GalleryEditor
          initial={widgetConfig?.gallery?.config?.items ?? []}
        />
      ) : null}

      {/* Timeline widget */}
      {hasTimeline ? (
        <TimelineEditor
          initial={widgetConfig?.timeline?.config?.items ?? []}
        />
      ) : null}

      {/* Achievement widget */}
      {hasAchievement ? (
        <AchievementEditor
          initial={widgetConfig?.achievement?.config?.items ?? []}
        />
      ) : null}

      {/* FAQ widget */}
      {hasFaq ? (
        <FaqEditor
          initial={widgetConfig?.faq?.config?.items ?? []}
        />
      ) : null}

      {/* Embed widget */}
      {hasEmbed ? (
        <EmbedEditor
          initial={widgetConfig?.embed?.config?.items ?? []}
        />
      ) : null}

      {/* Custom HTML widget */}
      {hasCustomHtml ? (
        <CustomHtmlEditor
          initial={widgetConfig?.["custom-html"]?.config?.html ?? ""}
        />
      ) : null}

      {/* Countdown widget — gratis (docs/09 §3) */}
      <CountdownConfigEditor
        initialLabel={widgetConfig?.countdown?.config?.label ?? ""}
        initialTargetDate={widgetConfig?.countdown?.config?.targetDate ?? ""}
      />

      {/* Clock widget — gratis (docs/09 §3) */}
      <ClockConfigEditor initialTimezone={widgetConfig?.clock?.config?.timezone ?? ""} />

      {/* GitHub Contribution widget */}
      {hasGithubGraph ? (
        <GithubGraphEditor initialUsername={widgetConfig?.["github-graph"]?.config?.username ?? ""} />
      ) : null}

      {/* RSS Feed widget */}
      {hasRssFeed ? (
        <RssFeedEditor initialUrl={widgetConfig?.["rss-feed"]?.config?.feedUrl ?? ""} />
      ) : null}

      {/* Crypto Ticker widget */}
      {hasCryptoTicker ? (
        <CryptoTickerEditor initialSymbols={widgetConfig?.["crypto-ticker"]?.config?.symbols ?? []} />
      ) : null}
    </div>
  );
}

// ─── Status ──────────────────────────────────────────────────────────────────

function StatusEditor({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await saveWidgetContent("status", { text });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Zap size={15} className="text-purple" />
        <h3 className="text-sm font-semibold text-text-primary">Custom Status</h3>
      </div>
      <p className="text-xs text-text-tertiary">
        Teks pendek yang muncul di widget Status. Terpisah dari Discord status.
      </p>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={80}
        placeholder="cth: Available for projects"
        className={inputClass}
      />
      <SaveButton pending={pending} saved={saved} onSave={save} />
    </div>
  );
}

// ─── Skills ──────────────────────────────────────────────────────────────────

interface SkillItem { label: string; category?: string; level?: number }

function SkillsEditor({ initial }: { initial: SkillItem[] }) {
  const [items, setItems] = useState<SkillItem[]>(initial.length ? initial : [{ label: "" }]);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function add() { setItems((p) => [...p, { label: "" }]); }
  function remove(i: number) { setItems((p) => p.filter((_, idx) => idx !== i)); }
  function update(i: number, key: keyof SkillItem, val: string) {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  function save() {
    startTransition(async () => {
      await saveWidgetContent("skills", { items: items.filter((s) => s.label.trim()) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Zap size={15} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-text-primary">Skills</h3>
      </div>
      <div className="space-y-2">
        {items.map((skill, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={skill.label}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="Nama skill"
              className={`${inputClass} flex-1`}
            />
            <input
              value={skill.category ?? ""}
              onChange={(e) => update(i, "category", e.target.value)}
              placeholder="Kategori"
              className={`${inputClass} w-28`}
            />
            <button
              type="button"
              onClick={() => remove(i)} aria-label="Hapus"
              className="h-10 w-10 flex-shrink-0 rounded-xl bg-red-400/5 border border-red-400/20 text-red-400 hover:bg-red-400/10 transition-colors flex items-center justify-center"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 text-xs text-purple hover:underline"
        >
          <Plus size={12} /> Tambah skill
        </button>
        <SaveButton pending={pending} saved={saved} onSave={save} compact />
      </div>
    </div>
  );
}

// ─── Projects ─────────────────────────────────────────────────────────────────

interface ProjectItem { title: string; description?: string; url?: string; repoUrl?: string; tags?: string; status?: string }

function ProjectsEditor({ initial }: { initial: ProjectItem[] }) {
  const [items, setItems] = useState<ProjectItem[]>(initial.length ? initial : [{ title: "" }]);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function add() { setItems((p) => [...p, { title: "" }]); }
  function remove(i: number) { setItems((p) => p.filter((_, idx) => idx !== i)); }
  function update(i: number, key: keyof ProjectItem, val: string) {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  function save() {
    startTransition(async () => {
      const clean = items
        .filter((p) => p.title.trim())
        .map((p) => ({
          ...p,
          tags: p.tags ? p.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }));
      await saveWidgetContent("projects", { items: clean });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Briefcase size={15} className="text-blue" />
        <h3 className="text-sm font-semibold text-text-primary">Projects</h3>
      </div>
      <div className="space-y-4">
        {items.map((proj, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-2 relative">
            <button
              type="button"
              onClick={() => remove(i)} aria-label="Hapus"
              className="absolute top-3 right-3 text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={13} />
            </button>
            <input value={proj.title} onChange={(e) => update(i, "title", e.target.value)} placeholder="Nama project *" className={inputClass} />
            <textarea value={proj.description ?? ""} onChange={(e) => update(i, "description", e.target.value)} placeholder="Deskripsi (opsional)" rows={2} className={`${inputClass} resize-none`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input value={proj.url ?? ""} onChange={(e) => update(i, "url", e.target.value)} placeholder="URL live" className={inputClass} />
              <input value={proj.repoUrl ?? ""} onChange={(e) => update(i, "repoUrl", e.target.value)} placeholder="URL repo" className={inputClass} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input value={proj.tags ?? ""} onChange={(e) => update(i, "tags", e.target.value)} placeholder="Tags (koma dipisah)" className={inputClass} />
              <select value={proj.status ?? "active"} onChange={(e) => update(i, "status", e.target.value)} className={inputClass}>
                <option value="active">Active</option>
                <option value="wip">WIP</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 text-xs text-purple hover:underline">
          <Plus size={12} /> Tambah project
        </button>
        <SaveButton pending={pending} saved={saved} onSave={save} compact />
      </div>
    </div>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

interface TestimonialItem { name: string; role?: string; content: string }

function TestimonialsEditor({ initial }: { initial: TestimonialItem[] }) {
  const [items, setItems] = useState<TestimonialItem[]>(initial.length ? initial : [{ name: "", content: "" }]);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function add() { setItems((p) => [...p, { name: "", content: "" }]); }
  function remove(i: number) { setItems((p) => p.filter((_, idx) => idx !== i)); }
  function update(i: number, key: keyof TestimonialItem, val: string) {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  function save() {
    startTransition(async () => {
      await saveWidgetContent("testimonials", { items: items.filter((t) => t.name && t.content) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Quote size={15} className="text-purple" />
        <h3 className="text-sm font-semibold text-text-primary">Testimonials</h3>
      </div>
      <div className="space-y-3">
        {items.map((t, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-2 relative">
            <button type="button" onClick={() => remove(i)} aria-label="Hapus" className="absolute top-3 right-3 text-red-400 hover:text-red-300">
              <Trash2 size={13} />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input value={t.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="Nama *" className={inputClass} />
              <input value={t.role ?? ""} onChange={(e) => update(i, "role", e.target.value)} placeholder="Role/jabatan" className={inputClass} />
            </div>
            <textarea value={t.content} onChange={(e) => update(i, "content", e.target.value)} placeholder="Isi testimonial *" rows={3} className={`${inputClass} resize-none`} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 text-xs text-purple hover:underline">
          <Plus size={12} /> Tambah testimonial
        </button>
        <SaveButton pending={pending} saved={saved} onSave={save} compact />
      </div>
    </div>
  );
}

// ─── Donate ──────────────────────────────────────────────────────────────────

interface DonateLink { platform: string; label: string; url: string }

function DonateEditor({ initial }: { initial: DonateLink[] }) {
  const [items, setItems] = useState<DonateLink[]>(initial.length ? initial : [{ platform: "saweria", label: "Support saya di Saweria", url: "" }]);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function add() { setItems((p) => [...p, { platform: "saweria", label: "", url: "" }]); }
  function remove(i: number) { setItems((p) => p.filter((_, idx) => idx !== i)); }
  function update(i: number, key: keyof DonateLink, val: string) {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  function save() {
    startTransition(async () => {
      await saveWidgetContent("donate", { links: items.filter((d) => d.url.trim()) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Heart size={15} className="text-red-400" />
        <h3 className="text-sm font-semibold text-text-primary">Donate / Support</h3>
      </div>
      <div className="space-y-2">
        {items.map((link, i) => (
          <div key={i} className="flex items-center gap-2">
            <select value={link.platform} onChange={(e) => update(i, "platform", e.target.value)} className={`${inputClass} w-28 flex-shrink-0`}>
              <option value="saweria">Saweria</option>
              <option value="trakteer">Trakteer</option>
              <option value="paypal">PayPal</option>
              <option value="custom">Custom</option>
            </select>
            <input value={link.label} onChange={(e) => update(i, "label", e.target.value)} placeholder="Label" className={`${inputClass} w-36`} />
            <input value={link.url} onChange={(e) => update(i, "url", e.target.value)} placeholder="URL" className={`${inputClass} flex-1`} />
            <button type="button" onClick={() => remove(i)} aria-label="Hapus" className="h-10 w-10 flex-shrink-0 rounded-xl bg-red-400/5 border border-red-400/20 text-red-400 hover:bg-red-400/10 transition-colors flex items-center justify-center">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 text-xs text-purple hover:underline">
          <Plus size={12} /> Tambah link donate
        </button>
        <SaveButton pending={pending} saved={saved} onSave={save} compact />
      </div>
    </div>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

interface GalleryImage { url: string; caption?: string }

function GalleryEditor({ initial }: { initial: GalleryImage[] }) {
  const [items, setItems] = useState<GalleryImage[]>(initial.length ? initial : [{ url: "" }]);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function add() { setItems((p) => [...p, { url: "" }]); }
  function remove(i: number) { setItems((p) => p.filter((_, idx) => idx !== i)); }
  function update(i: number, key: keyof GalleryImage, val: string) {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  function save() {
    startTransition(async () => {
      await saveWidgetContent("gallery", { items: items.filter((g) => g.url.trim()) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon size={15} className="text-blue" />
        <h3 className="text-sm font-semibold text-text-primary">Gallery</h3>
      </div>
      <p className="text-xs text-text-tertiary">
        Tempel URL gambar (upload dulu lewat host gambar pilihanmu, lalu tempel link-nya di sini).
      </p>
      <div className="space-y-2">
        {items.map((image, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={image.url}
              onChange={(e) => update(i, "url", e.target.value)}
              placeholder="https://..."
              className={`${inputClass} flex-1`}
            />
            <input
              value={image.caption ?? ""}
              onChange={(e) => update(i, "caption", e.target.value)}
              placeholder="Caption (opsional)"
              className={`${inputClass} w-40`}
            />
            <button
              type="button"
              onClick={() => remove(i)} aria-label="Hapus"
              className="h-10 w-10 flex-shrink-0 rounded-xl bg-red-400/5 border border-red-400/20 text-red-400 hover:bg-red-400/10 transition-colors flex items-center justify-center"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 text-xs text-purple hover:underline"
        >
          <Plus size={12} /> Tambah gambar
        </button>
        <SaveButton pending={pending} saved={saved} onSave={save} compact />
      </div>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

interface TimelineItem { title: string; date?: string; description?: string }

function TimelineEditor({ initial }: { initial: TimelineItem[] }) {
  const [items, setItems] = useState<TimelineItem[]>(initial.length ? initial : [{ title: "" }]);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function add() { setItems((p) => [...p, { title: "" }]); }
  function remove(i: number) { setItems((p) => p.filter((_, idx) => idx !== i)); }
  function update(i: number, key: keyof TimelineItem, val: string) {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  function save() {
    startTransition(async () => {
      await saveWidgetContent("timeline", { items: items.filter((t) => t.title.trim()) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Clock size={15} className="text-blue" />
        <h3 className="text-sm font-semibold text-text-primary">Timeline</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-2 relative">
            <button type="button" onClick={() => remove(i)} aria-label="Hapus" className="absolute top-3 right-3 text-red-400 hover:text-red-300">
              <Trash2 size={13} />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input value={item.title} onChange={(e) => update(i, "title", e.target.value)} placeholder="Judul *" className={inputClass} />
              <input value={item.date ?? ""} onChange={(e) => update(i, "date", e.target.value)} placeholder="Tanggal (cth: 2023 - Sekarang)" className={inputClass} />
            </div>
            <textarea value={item.description ?? ""} onChange={(e) => update(i, "description", e.target.value)} placeholder="Deskripsi (opsional)" rows={2} className={`${inputClass} resize-none`} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 text-xs text-purple hover:underline">
          <Plus size={12} /> Tambah entri
        </button>
        <SaveButton pending={pending} saved={saved} onSave={save} compact />
      </div>
    </div>
  );
}

// ─── Achievement ──────────────────────────────────────────────────────────────

interface AchievementItem { title: string; description?: string; icon?: string }

function AchievementEditor({ initial }: { initial: AchievementItem[] }) {
  const [items, setItems] = useState<AchievementItem[]>(initial.length ? initial : [{ title: "" }]);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function add() { setItems((p) => [...p, { title: "" }]); }
  function remove(i: number) { setItems((p) => p.filter((_, idx) => idx !== i)); }
  function update(i: number, key: keyof AchievementItem, val: string) {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  function save() {
    startTransition(async () => {
      await saveWidgetContent("achievement", { items: items.filter((a) => a.title.trim()) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Award size={15} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-text-primary">Achievement</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item.icon ?? ""}
              onChange={(e) => update(i, "icon", e.target.value)}
              placeholder="🏆"
              maxLength={4}
              className={`${inputClass} w-14 text-center flex-shrink-0`}
            />
            <input value={item.title} onChange={(e) => update(i, "title", e.target.value)} placeholder="Judul pencapaian" className={`${inputClass} flex-1`} />
            <input value={item.description ?? ""} onChange={(e) => update(i, "description", e.target.value)} placeholder="Keterangan singkat" className={`${inputClass} flex-1`} />
            <button type="button" onClick={() => remove(i)} aria-label="Hapus" className="h-10 w-10 flex-shrink-0 rounded-xl bg-red-400/5 border border-red-400/20 text-red-400 hover:bg-red-400/10 transition-colors flex items-center justify-center">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 text-xs text-purple hover:underline">
          <Plus size={12} /> Tambah achievement
        </button>
        <SaveButton pending={pending} saved={saved} onSave={save} compact />
      </div>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

interface FaqItem { question: string; answer: string }

function FaqEditor({ initial }: { initial: FaqItem[] }) {
  const [items, setItems] = useState<FaqItem[]>(initial.length ? initial : [{ question: "", answer: "" }]);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function add() { setItems((p) => [...p, { question: "", answer: "" }]); }
  function remove(i: number) { setItems((p) => p.filter((_, idx) => idx !== i)); }
  function update(i: number, key: keyof FaqItem, val: string) {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  function save() {
    startTransition(async () => {
      await saveWidgetContent("faq", { items: items.filter((f) => f.question.trim() && f.answer.trim()) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle size={15} className="text-purple" />
        <h3 className="text-sm font-semibold text-text-primary">FAQ</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-2 relative">
            <button type="button" onClick={() => remove(i)} aria-label="Hapus" className="absolute top-3 right-3 text-red-400 hover:text-red-300">
              <Trash2 size={13} />
            </button>
            <input value={item.question} onChange={(e) => update(i, "question", e.target.value)} placeholder="Pertanyaan *" className={inputClass} />
            <textarea value={item.answer} onChange={(e) => update(i, "answer", e.target.value)} placeholder="Jawaban *" rows={2} className={`${inputClass} resize-none`} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 text-xs text-purple hover:underline">
          <Plus size={12} /> Tambah FAQ
        </button>
        <SaveButton pending={pending} saved={saved} onSave={save} compact />
      </div>
    </div>
  );
}

// ─── Embed ────────────────────────────────────────────────────────────────────

interface EmbedItem { url: string; label?: string }

function EmbedEditor({ initial }: { initial: EmbedItem[] }) {
  const [items, setItems] = useState<EmbedItem[]>(initial.length ? initial : [{ url: "" }]);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function add() { setItems((p) => [...p, { url: "" }]); }
  function remove(i: number) { setItems((p) => p.filter((_, idx) => idx !== i)); }
  function update(i: number, key: keyof EmbedItem, val: string) {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  function save() {
    startTransition(async () => {
      await saveWidgetContent("embed", { items: items.filter((e) => e.url.trim()) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Code2 size={15} className="text-blue" />
        <h3 className="text-sm font-semibold text-text-primary">Embed</h3>
      </div>
      <p className="text-xs text-text-tertiary">
        Tempel link YouTube, Spotify, SoundCloud, atau Figma. Link dari platform lain akan tampil sebagai tombol link biasa (bukan embed), demi keamanan pengunjung profilmu.
      </p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item.url}
              onChange={(e) => update(i, "url", e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className={`${inputClass} flex-1`}
            />
            <input
              value={item.label ?? ""}
              onChange={(e) => update(i, "label", e.target.value)}
              placeholder="Label (fallback)"
              className={`${inputClass} w-36`}
            />
            <button type="button" onClick={() => remove(i)} aria-label="Hapus" className="h-10 w-10 flex-shrink-0 rounded-xl bg-red-400/5 border border-red-400/20 text-red-400 hover:bg-red-400/10 transition-colors flex items-center justify-center">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 text-xs text-purple hover:underline">
          <Plus size={12} /> Tambah embed
        </button>
        <SaveButton pending={pending} saved={saved} onSave={save} compact />
      </div>
    </div>
  );
}

// ─── Custom HTML ──────────────────────────────────────────────────────────────

function CustomHtmlEditor({ initial }: { initial: string }) {
  const [html, setHtml] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await saveWidgetContent("custom-html", { html });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Code2 size={15} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-text-primary">Custom HTML</h3>
      </div>
      <p className="text-xs text-text-tertiary">
        HTML dasar (paragraf, list, link, gambar). Tag/atribut berbahaya (script, iframe, event handler) otomatis disaring saat ditampilkan — demi keamanan pengunjung profilmu.
      </p>
      <textarea
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        placeholder="<p>Halo, ini profil saya...</p>"
        rows={6}
        className={`${inputClass} resize-none font-mono text-xs`}
      />
      <SaveButton pending={pending} saved={saved} onSave={save} compact />
    </div>
  );
}

// ─── Countdown (fase widget lanjutan, docs/09 §3) ──────────────────────────────

function CountdownConfigEditor({
  initialLabel,
  initialTargetDate,
}: {
  initialLabel: string;
  initialTargetDate: string;
}) {
  const [label, setLabel] = useState(initialLabel);
  // <input type="datetime-local"> butuh format "YYYY-MM-DDTHH:mm" tanpa
  // detik/zona — dipotong dari ISO string yang tersimpan kalau ada.
  const [targetDate, setTargetDate] = useState(initialTargetDate ? initialTargetDate.slice(0, 16) : "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await saveWidgetContent("countdown", {
        label,
        targetDate: targetDate ? new Date(targetDate).toISOString() : "",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Clock size={15} className="text-purple" />
        <h3 className="text-sm font-semibold text-text-primary">Countdown</h3>
      </div>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Judul, mis. 'Menuju rilis album baru'"
        className={inputClass}
      />
      <input
        type="datetime-local"
        value={targetDate}
        onChange={(e) => setTargetDate(e.target.value)}
        className={inputClass}
      />
      <SaveButton pending={pending} saved={saved} onSave={save} compact />
    </div>
  );
}

// ─── Clock (fase widget lanjutan, docs/09 §3) ──────────────────────────────────

const COMMON_TIMEZONES = [
  { value: "", label: "Waktu lokal pengunjung" },
  { value: "Asia/Jakarta", label: "WIB — Asia/Jakarta" },
  { value: "Asia/Makassar", label: "WITA — Asia/Makassar" },
  { value: "Asia/Jayapura", label: "WIT — Asia/Jayapura" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "America/New_York", label: "New York" },
  { value: "Europe/London", label: "London" },
];

function ClockConfigEditor({ initialTimezone }: { initialTimezone: string }) {
  const [timezone, setTimezone] = useState(initialTimezone);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await saveWidgetContent("clock", { timezone });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Clock size={15} className="text-purple" />
        <h3 className="text-sm font-semibold text-text-primary">Clock</h3>
      </div>
      <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass}>
        {COMMON_TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
      <SaveButton pending={pending} saved={saved} onSave={save} compact />
    </div>
  );
}

// ─── GitHub Contribution Graph ──────────────────────────────────────────────────

function GithubGraphEditor({ initialUsername }: { initialUsername: string }) {
  const [username, setUsername] = useState(initialUsername);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await saveWidgetContent("github-graph", { username: username.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Code2 size={15} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-text-primary">GitHub Contribution</h3>
      </div>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username GitHub, mis. 'torvalds'"
        className={inputClass}
      />
      <SaveButton pending={pending} saved={saved} onSave={save} compact />
    </div>
  );
}

// ─── RSS Feed ───────────────────────────────────────────────────────────────────

function RssFeedEditor({ initialUrl }: { initialUrl: string }) {
  const [feedUrl, setFeedUrl] = useState(initialUrl);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await saveWidgetContent("rss-feed", { feedUrl: feedUrl.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Zap size={15} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-text-primary">RSS Feed</h3>
      </div>
      <input
        value={feedUrl}
        onChange={(e) => setFeedUrl(e.target.value)}
        placeholder="https://blog-kamu.com/feed.xml"
        className={inputClass}
      />
      <p className="text-xs text-text-tertiary">
        Judul artikel terbaru dari feed ini akan tampil di profilmu.
      </p>
      <SaveButton pending={pending} saved={saved} onSave={save} compact />
    </div>
  );
}

// ─── Crypto Ticker ──────────────────────────────────────────────────────────────

function CryptoTickerEditor({ initialSymbols }: { initialSymbols: string[] }) {
  const [symbolsText, setSymbolsText] = useState(initialSymbols.join(", "));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      const symbols = symbolsText
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 5);
      await saveWidgetContent("crypto-ticker", { symbols });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Zap size={15} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-text-primary">Crypto Ticker</h3>
      </div>
      <input
        value={symbolsText}
        onChange={(e) => setSymbolsText(e.target.value)}
        placeholder="BTC, ETH, SOL (maks 5, dipisah koma)"
        className={inputClass}
      />
      <SaveButton pending={pending} saved={saved} onSave={save} compact />
    </div>
  );
}

function SaveButton({
  pending,
  saved,
  onSave,
  compact,
}: {
  pending: boolean;
  saved: boolean;
  onSave: () => void;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onSave}
        disabled={pending}
        className={`inline-flex items-center gap-2 rounded-xl bg-purple text-white font-medium transition-colors disabled:opacity-60 hover:bg-purple-dim ${
          compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
        }`}
      >
        {pending && <Loader2 size={12} className="animate-spin" />}
        Simpan
      </button>
      {saved && (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
          <CheckCircle2 size={12} /> Tersimpan
        </span>
      )}
    </div>
  );
}
