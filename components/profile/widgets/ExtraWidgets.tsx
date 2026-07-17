"use client";

import type { ActiveWidget } from "@/lib/widget-registry";
import { StatusWidget } from "./StatusWidget";
import { SkillsWidget, type SkillItem } from "./SkillsWidget";
import { ProjectsWidget, type ProjectItem } from "./ProjectsWidget";
import { GalleryWidget, type GalleryImage } from "./GalleryWidget";
import { TestimonialsWidget, type TestimonialItem } from "./TestimonialsWidget";
import { VisitorCountWidget } from "./VisitorCountWidget";
import { DonateWidget, type DonateLink } from "./DonateWidget";
import { ContactWidget } from "./ContactWidget";
import { TimelineWidget, type TimelineItem } from "./TimelineWidget";
import { AchievementWidget, type AchievementItem } from "./AchievementWidget";
import { FaqWidget, type FaqItem } from "./FaqWidget";
import { EmbedWidget, type EmbedItem } from "./EmbedWidget";
import { CustomHtmlWidget } from "./CustomHtmlWidget";
import { GuestbookWidget, type GuestbookEntryItem } from "./GuestbookWidget";
import { ReactionsWidget } from "./ReactionsWidget";
import { CountdownWidget } from "./CountdownWidget";
import { ClockWidget } from "./ClockWidget";
import { StatisticsWidget } from "./StatisticsWidget";
import { GithubGraphWidget } from "./GithubGraphWidget";
import { RssFeedWidget } from "./RssFeedWidget";
import { CryptoTickerWidget } from "./CryptoTickerWidget";

interface Props {
  activeWidgets: ActiveWidget[];
  userId: string;
  profileViews: number;
  /** docs/09 §3 — dijumlahkan dari ProfileLink.clicks, dihitung page.tsx */
  totalLinkClicks?: number;
  /** docs/09 §3 — jumlah UserBadge.unlockedAt yang tidak null */
  badgesCount?: number;
  /** docs/09 §3 — hasil fetch server (page.tsx), lihat catatan di masing-
   * masing file widget soal kenapa fetch tidak dilakukan di sini. */
  rssFeedTitles?: string[];
  cryptoPrices?: Record<string, number>;
  accentHex: string;
  /** Applied to the wrapper only when there's something to render. */
  className?: string;
  guestbookEntries?: GuestbookEntryItem[];
  reactionCounts?: Record<string, number>;
}

function getConfig<T>(activeWidgets: ActiveWidget[], key: string): T | undefined {
  return activeWidgets.find((w) => w.key === key)?.config as T | undefined;
}

/**
 * components/profile/widgets/ExtraWidgets.tsx
 *
 * Renders the "content" widgets (status, skills, projects, gallery,
 * testimonials, visitor count, donate, contact) — the ones backed by
 * User.widgetConfig[key].config rather than external data (Discord) or
 * props already threaded through every layout (about/social/links).
 *
 * Single source of truth so all profile layouts render the same widget
 * set the same way. Returns null when nothing is enabled/has content,
 * so callers can drop it in without an extra emptiness check.
 */
export function ExtraWidgets({
  activeWidgets,
  userId,
  profileViews,
  totalLinkClicks = 0,
  badgesCount = 0,
  rssFeedTitles = [],
  cryptoPrices = {},
  accentHex,
  className,
  guestbookEntries = [],
  reactionCounts = {},
}: Props) {
  const hasWidget = (key: string) => activeWidgets.some((w) => w.key === key);

  const statusConfig = getConfig<{ text?: string }>(activeWidgets, "status");
  const skillsConfig = getConfig<{ items?: SkillItem[] }>(activeWidgets, "skills");
  const projectsConfig = getConfig<{ items?: ProjectItem[] }>(activeWidgets, "projects");
  const galleryConfig = getConfig<{ items?: GalleryImage[] }>(activeWidgets, "gallery");
  const testimonialsConfig = getConfig<{ items?: TestimonialItem[] }>(activeWidgets, "testimonials");
  const donateConfig = getConfig<{ links?: DonateLink[] }>(activeWidgets, "donate");
  const timelineConfig = getConfig<{ items?: TimelineItem[] }>(activeWidgets, "timeline");
  const achievementConfig = getConfig<{ items?: AchievementItem[] }>(activeWidgets, "achievement");
  const faqConfig = getConfig<{ items?: FaqItem[] }>(activeWidgets, "faq");
  const embedConfig = getConfig<{ items?: EmbedItem[] }>(activeWidgets, "embed");
  const customHtmlConfig = getConfig<{ html?: string }>(activeWidgets, "custom-html");
  const countdownConfig = getConfig<{ label?: string; targetDate?: string }>(activeWidgets, "countdown");
  const clockConfig = getConfig<{ timezone?: string }>(activeWidgets, "clock");
  const githubGraphConfig = getConfig<{ username?: string }>(activeWidgets, "github-graph");

  const blocks: React.ReactNode[] = [];

  if (hasWidget("status") && statusConfig?.text) {
    blocks.push(<StatusWidget key="status" text={statusConfig.text} accentHex={accentHex} />);
  }
  if (hasWidget("skills") && skillsConfig?.items?.length) {
    blocks.push(<SkillsWidget key="skills" skills={skillsConfig.items} accentHex={accentHex} />);
  }
  if (hasWidget("projects") && projectsConfig?.items?.length) {
    blocks.push(<ProjectsWidget key="projects" projects={projectsConfig.items} accentHex={accentHex} />);
  }
  if (hasWidget("gallery") && galleryConfig?.items?.length) {
    blocks.push(<GalleryWidget key="gallery" images={galleryConfig.items} accentHex={accentHex} />);
  }
  if (hasWidget("testimonials") && testimonialsConfig?.items?.length) {
    blocks.push(<TestimonialsWidget key="testimonials" items={testimonialsConfig.items} accentHex={accentHex} />);
  }
  if (hasWidget("visitor-count")) {
    blocks.push(<VisitorCountWidget key="visitor-count" count={profileViews} accentHex={accentHex} />);
  }
  if (hasWidget("donate") && donateConfig?.links?.length) {
    blocks.push(<DonateWidget key="donate" links={donateConfig.links} accentHex={accentHex} />);
  }
  if (hasWidget("timeline") && timelineConfig?.items?.length) {
    blocks.push(<TimelineWidget key="timeline" items={timelineConfig.items} accentHex={accentHex} />);
  }
  if (hasWidget("achievement") && achievementConfig?.items?.length) {
    blocks.push(<AchievementWidget key="achievement" items={achievementConfig.items} accentHex={accentHex} />);
  }
  if (hasWidget("faq") && faqConfig?.items?.length) {
    blocks.push(<FaqWidget key="faq" items={faqConfig.items} accentHex={accentHex} />);
  }
  if (hasWidget("embed") && embedConfig?.items?.length) {
    blocks.push(<EmbedWidget key="embed" items={embedConfig.items} accentHex={accentHex} />);
  }
  if (hasWidget("custom-html") && customHtmlConfig?.html) {
    blocks.push(<CustomHtmlWidget key="custom-html" html={customHtmlConfig.html} accentHex={accentHex} />);
  }
  if (hasWidget("contact")) {
    blocks.push(<ContactWidget key="contact" targetUserId={userId} accentHex={accentHex} />);
  }
  if (hasWidget("reactions")) {
    blocks.push(<ReactionsWidget key="reactions" userId={userId} initialCounts={reactionCounts} />);
  }
  if (hasWidget("guestbook")) {
    blocks.push(
      <GuestbookWidget key="guestbook" userId={userId} entries={guestbookEntries} accentHex={accentHex} />
    );
  }
  if (hasWidget("countdown") && countdownConfig?.label && countdownConfig?.targetDate) {
    blocks.push(
      <CountdownWidget
        key="countdown"
        label={countdownConfig.label}
        targetDate={countdownConfig.targetDate}
        accentHex={accentHex}
      />
    );
  }
  if (hasWidget("clock")) {
    blocks.push(<ClockWidget key="clock" timezone={clockConfig?.timezone} accentHex={accentHex} />);
  }
  if (hasWidget("statistics")) {
    blocks.push(
      <StatisticsWidget
        key="statistics"
        profileViews={profileViews}
        totalLinkClicks={totalLinkClicks}
        badgesCount={badgesCount}
        accentHex={accentHex}
      />
    );
  }
  if (hasWidget("github-graph") && githubGraphConfig?.username) {
    blocks.push(<GithubGraphWidget key="github-graph" username={githubGraphConfig.username} />);
  }
  if (hasWidget("rss-feed") && rssFeedTitles.length > 0) {
    blocks.push(<RssFeedWidget key="rss-feed" titles={rssFeedTitles} />);
  }
  if (hasWidget("crypto-ticker") && Object.keys(cryptoPrices).length > 0) {
    blocks.push(<CryptoTickerWidget key="crypto-ticker" prices={cryptoPrices} />);
  }

  if (blocks.length === 0) return null;

  return <div className={`space-y-4 ${className ?? ""}`}>{blocks}</div>;
}
