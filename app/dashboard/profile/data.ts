/**
 * app/dashboard/profile/data.ts
 *
 * Social platform definitions used in profile settings and public profile.
 * Add new platforms here — no other files need to change.
 */

export type SocialPlatform =
  | "github"
  | "discord"
  | "twitter"
  | "instagram"
  | "youtube"
  | "twitch"
  | "tiktok"
  | "spotify"
  | "steam"
  | "facebook"
  | "threads"
  | "reddit"
  | "linkedin"
  | "telegram"
  | "whatsapp"
  | "website"
  | "email";

export const SOCIAL_PLATFORMS: ReadonlyArray<{
  id: SocialPlatform;
  label: string;
  placeholder: string;
  prefix?: string;    // auto-prepend URL prefix for bare username input
  category: "social" | "gaming" | "music" | "professional" | "contact";
}> = [
  // Social
  {
    id: "discord",
    label: "Discord",
    placeholder: "https://discord.gg/your-server",
    category: "social",
  },
  {
    id: "twitter",
    label: "X / Twitter",
    placeholder: "https://x.com/username",
    category: "social",
  },
  {
    id: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/username",
    category: "social",
  },
  {
    id: "tiktok",
    label: "TikTok",
    placeholder: "https://tiktok.com/@username",
    category: "social",
  },
  {
    id: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/username",
    category: "social",
  },
  {
    id: "threads",
    label: "Threads",
    placeholder: "https://threads.net/@username",
    category: "social",
  },
  {
    id: "reddit",
    label: "Reddit",
    placeholder: "https://reddit.com/u/username",
    category: "social",
  },

  // Professional & dev
  {
    id: "github",
    label: "GitHub",
    placeholder: "https://github.com/username",
    category: "professional",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/username",
    category: "professional",
  },
  {
    id: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@channel",
    category: "social",
  },
  {
    id: "twitch",
    label: "Twitch",
    placeholder: "https://twitch.tv/username",
    category: "gaming",
  },

  // Music & gaming
  {
    id: "spotify",
    label: "Spotify",
    placeholder: "https://open.spotify.com/user/username",
    category: "music",
  },
  {
    id: "steam",
    label: "Steam",
    placeholder: "https://steamcommunity.com/id/username",
    category: "gaming",
  },

  // Messaging & contact
  {
    id: "telegram",
    label: "Telegram",
    placeholder: "https://t.me/username",
    category: "contact",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    placeholder: "https://wa.me/628xxxxxxxxxx",
    category: "contact",
  },
  {
    id: "website",
    label: "Website",
    placeholder: "https://yourwebsite.com",
    category: "contact",
  },
  {
    id: "email",
    label: "Email",
    placeholder: "mailto:you@example.com",
    category: "contact",
  },
];

export const SOCIAL_CATEGORIES = [
  { id: "social", label: "Media Sosial" },
  { id: "professional", label: "Profesional & Dev" },
  { id: "gaming", label: "Gaming" },
  { id: "music", label: "Musik" },
  { id: "contact", label: "Kontak" },
] as const;
