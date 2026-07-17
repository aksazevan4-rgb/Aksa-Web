import type { ReactNode, CSSProperties } from "react";
import { Globe, Link2, Mail, Phone, ShoppingBag } from "lucide-react";

/**
 * components/LinkIcon.tsx
 *
 * Extended to cover all platforms in SOCIAL_PLATFORMS (data.ts).
 * Brand icons are hand-crafted SVGs — lucide-react removed brand icons
 * in v1.21+. Keep additions here in sync with data.ts.
 */

type IconProps = { size?: number; className?: string; style?: CSSProperties };

// ── Brand SVGs ────────────────────────────────────────────────────────────────

function Instagram({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className} style={style}>
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="7" r="1.2" fill="currentColor" />
    </svg>
  );
}

function TikTok({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className} style={style}>
      <path d="M14.5 3.25v11.1a4.9 4.9 0 1 1-4.9-4.9c.31 0 .61.03.9.08v2.98a2.04 2.04 0 1 0 1.02 1.77V3.25h2.98Z" fill="currentColor" />
      <path d="M14.5 3.25c.42 2.5 2.13 4.21 4.6 4.52v2.94c-1.78-.08-3.35-.73-4.6-1.82V3.25Z" fill="currentColor" opacity=".72" />
    </svg>
  );
}

function YouTube({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className} style={style}>
      <path d="M21.8 8.1c-.2-1.1-1.1-2-2.2-2.2C18 5.5 15.8 5.5 12 5.5s-6 .1-7.6.4C3.3 6.1 2.4 7 2.2 8.1 2 9.3 2 10.7 2 12s0 2.7.2 3.9c.2 1.1 1.1 2 2.2 2.2 1.6.3 3.8.4 7.6.4s6-.1 7.6-.4c1.1-.2 2-1.1 2.2-2.2.2-1.2.2-2.6.2-3.9s0-2.7-.2-3.9Z" fill="currentColor" />
      <path d="M10 9.2v5.6l5-2.8-5-2.8Z" fill="white" />
    </svg>
  );
}

function Discord({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M20.3 4.4A18.2 18.2 0 0 0 15.8 3l-.2.4c1.6.4 2.4 1 2.4 1a14.2 14.2 0 0 0-12 0s.8-.6 2.5-1L8.2 3a18.2 18.2 0 0 0-4.5 1.4C.9 8.5.2 12.5.6 16.5A18.4 18.4 0 0 0 6.2 19.4l.7-.9c-1.3-.4-2-.9-2-.9l.5-.3c3.8 1.8 7.9 1.8 11.6 0l.5.3s-.7.5-2 .9l.7.9a18.4 18.4 0 0 0 5.6-2.9c.5-4.6-.7-8.5-3.5-12.1ZM8.3 14.8c-1.1 0-2-1-2-2.2s.9-2.2 2-2.2 2 1 2 2.2-.9 2.2-2 2.2Zm7.4 0c-1.1 0-2-1-2-2.2s.9-2.2 2-2.2 2 1 2 2.2-.9 2.2-2 2.2Z" />
    </svg>
  );
}

function Twitter({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M18.9 3h3.1l-6.8 7.8L23 21h-6.3l-4.9-6.4L6 21H2.9l7.3-8.3L2 3h6.4l4.5 5.9L18.9 3Zm-1.1 16.2h1.7L7.3 4.7H5.5l12.3 14.5Z" />
    </svg>
  );
}

function WhatsApp({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2Zm5.6 14.1c-.2.6-1.3 1.2-1.9 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-5-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3 0-1.4.7-2.1 1-2.4.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5.2.5.7 1.7.8 1.8.1.2.1.3 0 .5-.1.2-.2.3-.3.5-.2.2-.3.3-.5.5-.2.2-.4.4-.2.7.2.4 1 1.6 2 2.5 1.3 1.2 2.4 1.6 2.8 1.7.3.1.5.1.7-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.7.8.3.1.4.2.5.3.1.2.1.7-.1 1.2Z" />
    </svg>
  );
}

function Twitch({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M4 2 2.5 5.5v14H7V22l3-2.5h3.5L19 14V2H4Zm13.3 11.2-2.8 2.8h-2.8l-2.5 2.5v-2.5H6V3.7h11.3v9.5Z" />
      <path d="M14.5 6.5h1.7v4.3h-1.7V6.5Zm-4 0h1.7v4.3H10.5V6.5Z" />
    </svg>
  );
}

function GitHub({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.93c.58.11.79-.25.79-.56v-2.16c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.27-5.23-5.67 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.37-5.25 5.66.42.36.79 1.06.79 2.15v3.18c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function Spotify({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.42.122-.78-.179-.9-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.16-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function Steam({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.030 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.624 0 11.99-5.365 11.99-11.99C23.969 5.365 18.603 0 11.979 0zm-4.1 17.539l-1.39-.577c.246.507.657.929 1.199 1.161 1.145.484 2.463-.044 2.945-1.189.233-.552.232-1.166-.003-1.717a2.209 2.209 0 0 0-1.213-1.199 2.218 2.218 0 0 0-1.726.012l1.435.595c.841.356 1.234 1.326.876 2.168-.356.842-1.325 1.235-2.168.878z" />
    </svg>
  );
}

function Facebook({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function Threads({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 1.355-.007 2.587-.19 3.695-.58 1.318-.463 2.364-1.199 3.115-2.188.98-1.32 1.474-3.064 1.474-5.14v-.162h-7.647v-2.114h9.851v2.114c0 2.858-.66 5.221-1.962 7.022-1.576 2.182-3.963 3.35-7.079 3.35h-.047V24z" />
    </svg>
  );
}

function Reddit({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

function LinkedIn({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function Telegram({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function Line({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M12 2C6.477 2 2 5.68 2 10.2c0 4.05 3.55 7.44 8.35 8.08.325.07.767.215.878.494.1.253.065.65.032.906l-.142.86c-.043.253-.196.99.867.54 1.063-.45 5.735-3.38 7.828-5.79C21.185 13.44 22 11.9 22 10.2 22 5.68 17.523 2 12 2Zm-2.87 10.45H7.66a.28.28 0 0 1-.28-.28V8.15a.28.28 0 0 1 .56 0v3.46h1.19a.28.28 0 0 1 0 .56Zm1.5.28a.28.28 0 0 1-.28-.28V8.15a.28.28 0 0 1 .56 0v4.02a.28.28 0 0 1-.28.28Zm4.53 0a.28.28 0 0 1-.28-.28V9.29l-1.62 2.98a.28.28 0 0 1-.5 0L11.14 9.3v2.87a.28.28 0 0 1-.56 0V8.15a.28.28 0 0 1 .53-.14l1.83 3.36 1.83-3.36a.28.28 0 0 1 .53.14v4.02a.28.28 0 0 1-.28.28Zm3.85 0h-1.75a.28.28 0 0 1-.28-.28V8.15a.28.28 0 0 1 .28-.28h1.75a.28.28 0 0 1 0 .56h-1.47v1.19h1.47a.28.28 0 0 1 0 .56h-1.47v1.19h1.47a.28.28 0 0 1 0 .56Z" />
    </svg>
  );
}

function Shopee({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M12 2c1.66 0 3 1.5 3 3.35V6h2.2c.66 0 1.2.5 1.27 1.15l1.02 12.3A2 2 0 0 1 17.5 21.6H6.5a2 2 0 0 1-1.99-2.15l1.02-12.3A1.28 1.28 0 0 1 6.8 6H9v-.65C9 3.5 10.34 2 12 2Zm0 1.6c-.78 0-1.4.77-1.4 1.75V6h2.8v-.65c0-.98-.62-1.75-1.4-1.75ZM9.2 11c.5 1.6 2 2.4 3.4 2.85 1.1.35 1.7.66 1.7 1.32 0 .58-.55.96-1.35.96-.86 0-1.5-.42-1.75-1.15l-1.45.5c.42 1.26 1.6 2.02 3.15 2.02 1.85 0 3.05-1.02 3.05-2.45 0-1.4-1.05-2.02-2.65-2.55-1.25-.4-2.15-.75-2.15-1.55 0-.58.5-.95 1.22-.95.72 0 1.2.38 1.4 1.02l1.4-.55C13.75 8.9 12.7 8.2 11.4 8.2c-1.62 0-2.7.95-2.7 2.28 0 .2.02.37.05.52Z" />
    </svg>
  );
}

function Tokopedia({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className} style={style}>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" />
      <circle cx="12" cy="10.5" r="3.4" fill="white" />
      <path d="M8 15.2c1-.9 2.4-1.4 4-1.4s3 .5 4 1.4" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Simple rounded-badge with a short monogram — used for platforms whose
 * full logo is a multi-color wordmark (e-wallets, delivery apps, misc SaaS)
 * where a hand-drawn glyph is clearer at 16-20px than an approximation of
 * the real mark. Background comes from currentColor so it still follows
 * the color passed to <LinkIcon />. */
function monogram(text: string) {
  return function MonogramIcon({ size = 16, className, style }: IconProps) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className} style={style}>
        <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="currentColor" opacity="0.16" />
        <rect x="1.5" y="1.5" width="21" height="21" rx="6" stroke="currentColor" strokeWidth="1.3" fill="none" />
        <text
          x="12"
          y="12.8"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={text.length > 2 ? 7.5 : 9.5}
          fontWeight="700"
          fill="currentColor"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {text}
        </text>
      </svg>
    );
  };
}

function QrisIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className} style={style}>
      <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="15" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="15" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="5.3" y="5.3" width="1.4" height="1.4" fill="currentColor" />
      <rect x="17.3" y="5.3" width="1.4" height="1.4" fill="currentColor" />
      <rect x="5.3" y="17.3" width="1.4" height="1.4" fill="currentColor" />
      <rect x="15" y="15" width="2.5" height="2.5" fill="currentColor" />
      <rect x="18.5" y="15" width="2.5" height="2.5" fill="currentColor" />
      <rect x="15" y="18.5" width="2.5" height="2.5" fill="currentColor" />
    </svg>
  );
}

function GoogleDrive({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M8.1 2.6 1.4 14.4l3.3 5.7 6.7-11.8L8.1 2.6Z" opacity=".85" />
      <path d="M9.9 20.1h11.7l-3.3-5.7H6.6l3.3 5.7Z" opacity=".65" />
      <path d="M15.9 2.6H8.1l6.7 11.8h7.8L15.9 2.6Z" />
    </svg>
  );
}

function GoogleMeet({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <rect x="2" y="6" width="13" height="12" rx="2.2" />
      <path d="M15 10.2 22 6v12l-7-4.2v-3.6Z" opacity=".85" />
    </svg>
  );
}

function GoogleForm({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className} style={style}>
      <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 8h5M7.5 12h9M7.5 16h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="7" cy="16" r="0.9" fill="currentColor" />
    </svg>
  );
}

function Zoom({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <rect x="1.5" y="6" width="15" height="12" rx="3" />
      <path d="M17.5 10.3 22 7v10l-4.5-3.3v-3.4Z" opacity=".85" />
    </svg>
  );
}

function MicrosoftTeams({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <circle cx="17" cy="5.5" r="2.3" opacity=".8" />
      <rect x="13" y="8.5" width="9" height="9" rx="2" opacity=".8" />
      <circle cx="8.2" cy="6" r="3" />
      <rect x="2" y="9.5" width="11.5" height="10.5" rx="2.2" />
    </svg>
  );
}

// ── Icon map ──────────────────────────────────────────────────────────────────

export const LINK_ICON_MAP: Record<string, (props: IconProps) => ReactNode> = {
  // Generic
  link: Link2,
  website: Globe,
  email: Mail,
  phone: Phone,
  shop: ShoppingBag,
  // Social
  discord: Discord,
  twitter: Twitter,
  instagram: Instagram,
  tiktok: TikTok,
  facebook: Facebook,
  threads: Threads,
  reddit: Reddit,
  youtube: YouTube,
  twitch: Twitch,
  line: Line,
  // Professional / dev
  github: GitHub,
  linkedin: LinkedIn,
  // Music / gaming
  spotify: Spotify,
  steam: Steam,
  // Messaging
  telegram: Telegram,
  whatsapp: WhatsApp,
  // Indonesian e-commerce
  shopee: Shopee,
  tokopedia: Tokopedia,
  "tiktok-shop": TikTok,
  lazada: monogram("Laz"),
  bukalapak: monogram("BL"),
  blibli: monogram("Bli"),
  // Food / travel
  gofood: monogram("Go"),
  grabfood: monogram("Grab"),
  traveloka: monogram("Trv"),
  // E-wallet / payment
  dana: monogram("Dana"),
  ovo: monogram("OVO"),
  gopay: monogram("Go"),
  shopeepay: monogram("SP"),
  linkaja: monogram("LA"),
  qris: QrisIcon,
  bank: monogram("Bank"),
  // Donation / support (ID creator economy)
  saweria: monogram("Swr"),
  trakteer: monogram("Trk"),
  sociabuzz: monogram("SB"),
  "lynk-id": monogram("Lynk"),
  // Productivity / meetings
  "google-drive": GoogleDrive,
  "google-form": GoogleForm,
  "google-meet": GoogleMeet,
  zoom: Zoom,
  teams: MicrosoftTeams,
};

export const LINK_ICON_OPTIONS: ReadonlyArray<{ key: string; label: string; group: string }> = [
  { key: "link", label: "Link Umum", group: "Umum" },
  { key: "website", label: "Website", group: "Umum" },
  { key: "email", label: "Email", group: "Umum" },
  { key: "phone", label: "Telepon", group: "Umum" },
  { key: "shop", label: "Toko / Produk", group: "Umum" },

  { key: "discord", label: "Discord", group: "Sosial & Komunitas" },
  { key: "instagram", label: "Instagram", group: "Sosial & Komunitas" },
  { key: "twitter", label: "X / Twitter", group: "Sosial & Komunitas" },
  { key: "tiktok", label: "TikTok", group: "Sosial & Komunitas" },
  { key: "facebook", label: "Facebook", group: "Sosial & Komunitas" },
  { key: "threads", label: "Threads", group: "Sosial & Komunitas" },
  { key: "reddit", label: "Reddit", group: "Sosial & Komunitas" },
  { key: "linkedin", label: "LinkedIn", group: "Sosial & Komunitas" },
  { key: "line", label: "LINE", group: "Sosial & Komunitas" },
  { key: "telegram", label: "Telegram", group: "Sosial & Komunitas" },
  { key: "whatsapp", label: "WhatsApp", group: "Sosial & Komunitas" },

  { key: "youtube", label: "YouTube", group: "Media & Musik" },
  { key: "twitch", label: "Twitch", group: "Media & Musik" },
  { key: "spotify", label: "Spotify", group: "Media & Musik" },
  { key: "steam", label: "Steam", group: "Media & Musik" },
  { key: "github", label: "GitHub", group: "Media & Musik" },

  { key: "shopee", label: "Shopee", group: "E-commerce" },
  { key: "tokopedia", label: "Tokopedia", group: "E-commerce" },
  { key: "tiktok-shop", label: "TikTok Shop", group: "E-commerce" },
  { key: "lazada", label: "Lazada", group: "E-commerce" },
  { key: "bukalapak", label: "Bukalapak", group: "E-commerce" },
  { key: "blibli", label: "Blibli", group: "E-commerce" },

  { key: "gofood", label: "GoFood", group: "Kuliner & Travel" },
  { key: "grabfood", label: "GrabFood", group: "Kuliner & Travel" },
  { key: "traveloka", label: "Traveloka", group: "Kuliner & Travel" },

  { key: "dana", label: "DANA", group: "Pembayaran" },
  { key: "ovo", label: "OVO", group: "Pembayaran" },
  { key: "gopay", label: "GoPay", group: "Pembayaran" },
  { key: "shopeepay", label: "ShopeePay", group: "Pembayaran" },
  { key: "linkaja", label: "LinkAja", group: "Pembayaran" },
  { key: "qris", label: "QRIS", group: "Pembayaran" },
  { key: "bank", label: "Rekening Bank", group: "Pembayaran" },

  { key: "saweria", label: "Saweria", group: "Donasi" },
  { key: "trakteer", label: "Trakteer", group: "Donasi" },
  { key: "sociabuzz", label: "Sociabuzz", group: "Donasi" },
  { key: "lynk-id", label: "Lynk.id", group: "Donasi" },

  { key: "google-drive", label: "Google Drive", group: "Produktivitas" },
  { key: "google-form", label: "Google Form", group: "Produktivitas" },
  { key: "google-meet", label: "Google Meet", group: "Produktivitas" },
  { key: "zoom", label: "Zoom", group: "Produktivitas" },
  { key: "teams", label: "Microsoft Teams", group: "Produktivitas" },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface LinkIconProps {
  icon?: string | null;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function LinkIcon({ icon, size = 16, className, style }: LinkIconProps) {
  const Icon = LINK_ICON_MAP[icon ?? "link"] ?? Link2;
  return <Icon size={size} className={className} style={style} />;
}
