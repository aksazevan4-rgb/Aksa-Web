import { verifySession } from "@/lib/dal";
import { LayoutTemplate } from "lucide-react";
import { listPublicTemplates, listMyTemplates } from "./actions";
import { TemplatesClient } from "./TemplatesClient";

export default async function TemplatesPage() {
  await verifySession();

  const [publicTemplates, myTemplates] = await Promise.all([
    listPublicTemplates(),
    listMyTemplates(),
  ]);

  return (
    <main className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <LayoutTemplate size={20} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Template Marketplace
          </h1>
          <p className="text-sm text-text-tertiary">
            Pakai template siap jadi, atau simpan tampilanmu sendiri untuk dibagikan.
          </p>
        </div>
      </div>

      <TemplatesClient
        publicTemplates={publicTemplates.map((t) => ({
          ...t,
          author: t.author?.username ?? t.author?.name ?? null,
        }))}
        myTemplates={myTemplates.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          category: t.category,
          visibility: t.visibility,
          isBuiltIn: t.isBuiltIn,
          useCount: t.useCount,
          layoutKey: t.layoutKey,
          themeKey: t.themeKey,
        }))}
      />
    </main>
  );
}
