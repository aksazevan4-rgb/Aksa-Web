import type { CSSProperties } from "react";

export type BrandIconProps = {
  size?: number;
  className?: string;
  style?: CSSProperties;
};

export function GitHubIcon({ size = 20, className, style }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.93c.58.11.79-.25.79-.56v-2.16c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.27-5.23-5.67 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.37-5.25 5.66.42.36.79 1.06.79 2.15v3.18c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function DiscordIcon({ size = 20, className, style }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M20.3 4.4A18.2 18.2 0 0 0 15.8 3l-.2.4c1.6.4 2.4 1 2.4 1a14.2 14.2 0 0 0-12 0s.8-.6 2.5-1L8.2 3a18.2 18.2 0 0 0-4.5 1.4C.9 8.5.2 12.5.6 16.5A18.4 18.4 0 0 0 6.2 19.4l.7-.9c-1.3-.4-2-.9-2-.9l.5-.3c3.8 1.8 7.9 1.8 11.6 0l.5.3s-.7.5-2 .9l.7.9a18.4 18.4 0 0 0 5.6-2.9c.5-4.6-.7-8.5-3.5-12.1ZM8.3 14.8c-1.1 0-2-1-2-2.2s.9-2.2 2-2.2 2 1 2 2.2-.9 2.2-2 2.2Zm7.4 0c-1.1 0-2-1-2-2.2s.9-2.2 2-2.2 2 1 2 2.2-.9 2.2-2 2.2Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 20, className, style }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className} style={style}>
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="7" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function TikTokIcon({ size = 20, className, style }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className} style={style}>
      <path d="M14.5 3.25v11.1a4.9 4.9 0 1 1-4.9-4.9c.31 0 .61.03.9.08v2.98a2.04 2.04 0 1 0 1.02 1.77V3.25h2.98Z" fill="currentColor" />
      <path d="M14.5 3.25c.42 2.5 2.13 4.21 4.6 4.52v2.94c-1.78-.08-3.35-.73-4.6-1.82V3.25Z" fill="currentColor" opacity=".72" />
    </svg>
  );
}

export function YouTubeIcon({ size = 20, className, style }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className} style={style}>
      <path d="M21.8 8.1c-.2-1.1-1.1-2-2.2-2.2C18 5.5 15.8 5.5 12 5.5s-6 .1-7.6.4C3.3 6.1 2.4 7 2.2 8.1 2 9.3 2 10.7 2 12s0 2.7.2 3.9c.2 1.1 1.1 2 2.2 2.2 1.6.3 3.8.4 7.6.4s6-.1 7.6-.4c1.1-.2 2-1.1 2.2-2.2.2-1.2.2-2.6.2-3.9s0-2.7-.2-3.9Z" fill="currentColor" />
      <path d="M10 9.2v5.6l5-2.8-5-2.8Z" fill="white" />
    </svg>
  );
}

export function AppleIcon({ size = 20, className, style }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M16.37 1.33c.04 1.06-.38 2.1-1.13 2.86-.79.82-2.07 1.46-3.09 1.38-.13-1.02.37-2.12 1.08-2.86.78-.82 2.14-1.43 3.14-1.38ZM20.44 17.02c-.55 1.22-.82 1.77-1.53 2.85-.99 1.5-2.39 3.38-4.12 3.39-1.54.01-1.94-.99-4.03-.98-2.09.01-2.53 1-4.07.99-1.73-.02-3.05-1.71-4.04-3.21C-.1 15.88-.39 10.97 1.42 8.34 2.7 6.48 4.72 5.39 6.62 5.39c1.94 0 3.16 1.01 4.76 1.01 1.56 0 2.51-1.01 4.75-1.01 1.69 0 3.49.88 4.76 2.39-4.18 2.18-3.5 7.86-.45 9.24Z" />
    </svg>
  );
}
