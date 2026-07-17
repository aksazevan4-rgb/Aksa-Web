import type { LucideIcon } from "lucide-react";

/**
 * Header section yang konsisten dipakai di semua form CMS/dashboard:
 * ikon bulat dengan aksen ungu, judul, dan deskripsi opsional. Diekstrak
 * jadi komponen bersama supaya tampilan antar form (Profile Settings,
 * Edit About Me, Projects, dll) selalu seragam tanpa duplikasi style.
 */
export function FormSectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {description && (
          <p className="text-xs text-text-tertiary mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}
