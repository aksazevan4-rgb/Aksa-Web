/**
 * components/profile/layouts/index.ts
 *
 * Registry mapping layout keys to their components. The public profile
 * page reads User.profileLayout, looks it up here, and renders the
 * matching component. To add a new layout: create the component file
 * implementing ProfileLayoutProps, then add one line below.
 */

import { ClassicLayout } from "./ClassicLayout";
import { ModernLayout } from "./ModernLayout";
import { GlassLayout } from "./GlassLayout";
import { MinimalLayout } from "./MinimalLayout";
import { CompactLayout } from "./CompactLayout";
import { FullWidthLayout } from "./FullWidthLayout";
import { CreatorLayout } from "./CreatorLayout";
import { ShowcaseLayout } from "./ShowcaseLayout";
import type { ProfileLayoutProps } from "./types";

export const LAYOUT_COMPONENTS: Record<string, React.ComponentType<ProfileLayoutProps>> = {
  classic: ClassicLayout,
  modern: ModernLayout,
  glass: GlassLayout,
  minimal: MinimalLayout,
  compact: CompactLayout,
  fullwidth: FullWidthLayout,
  creator: CreatorLayout,
  showcase: ShowcaseLayout,
};

export function getLayoutComponent(key: string | null | undefined) {
  return LAYOUT_COMPONENTS[key ?? "classic"] ?? ClassicLayout;
}

export type { ProfileLayoutProps } from "./types";
