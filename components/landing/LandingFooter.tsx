import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Globe } from "lucide-react";
import type { SiteConfigData } from "@/lib/site-config";

const Instagram = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5zm0 2h8.5A3.75 3.75 0 0 1 20 7.75v8.5A3.75 3.75 0 0 1 16.25 20h-8.5A3.75 3.75 0 0 1 4 16.25v-8.5A3.75 3.75 0 0 1 7.75 4zm8.75 1a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 16.5 5zM12 6.5A5.5 5.5 0 1 0 12 17.5A5.5 5.5 0 0 0 12 6.5zm0 2A3.5 3.5 0 1 1 12 15.5A3.5 3.5 0 0 1 12 8.5z" />
  </svg>
);
const Youtube = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M23.5 6.2c-.3-1.2-1.2-2.1-2.4-2.4C19 3.2 12 3.2 12 3.2s-7 0-9.1.6C1.7 4.1.8 5 .5 6.2 0 8.3 0 12 0 12s0 3.7.5 5.8c.3 1.2 1.2 2.1 2.4 2.4 2.1.6 9.1.6 9.1.6s7 0 9.1-.6c1.2-.3 2.1-1.2 2.4-2.4.5-2.1.5-5.8.5-5.8s0-3.7-.5-5.8zM9.5 15.5v-7l6 3.5-6 3.5z" />
  </svg>
);
interface Props {
  config: SiteConfigData;
}
const GitHub = ({ className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.15c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.76 2.68 1.25 3.33.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.47.11-3.07 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.18-1.49 3.14-1.18 3.14-1.18.63 1.6.24 2.78.12 3.07.73.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.39-5.25 5.68.41.35.77 1.04.77 2.09v3.1c0 .31.2.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);
const FOOTER_LINKS = {
  Platform: [
    { label: "Fitur", href: "#features" },
    { label: "Cara Kerja", href: "#how-it-works" },
    { label: "Harga", href: "#pricing" },
  ],
  Akun: [
    { label: "Masuk", href: "/login" },
    { label: "Daftar", href: "/register" },
    { label: "Dashboard", href: "/dashboard" },
  ],
};

export default function LandingFooter({ config }: Props) {
  const year = new Date().getFullYear();

  const socials = [
    { icon: GitHub, url: config.socialGithub },
    { icon: MessageSquare, url: config.socialDiscord },
    { icon: Instagram, url: config.socialInstagram },
    { icon: Youtube, url: config.socialYoutube },
    { icon: Globe, url: config.socialWebsite },
  ].filter((s) => s.url);

  return (
    <footer className="relative border-t border-border px-5 pt-16 pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-purple/30 bg-black/20">
                <Image
                  src="/aksa-logo.png"
                  alt={config.siteName}
                  width={36}
                  height={36}
                  className="h-8 w-8 rounded-full object-contain"
                />
              </span>
              <span className="font-display font-semibold text-text-primary text-sm">
                {config.siteName}
              </span>
            </Link>
            <p className="text-sm text-text-tertiary max-w-xs leading-relaxed">
              {config.siteDescription}
            </p>

            {socials.length > 0 && (
              <div className="flex items-center gap-2 mt-5">
                {socials.map(({ icon: Icon, url }, i) => (
                  <a
                    key={i}
                    href={url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 w-9 rounded-lg glass flex items-center justify-center text-text-tertiary hover:text-purple hover:border-purple/30 transition-colors"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-xs font-mono text-text-tertiary uppercase tracking-widest mb-4">
                {heading}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-tertiary">
            © {year} {config.siteName}. All rights reserved.
          </p>
          <p className="text-xs text-text-tertiary">
            Dibangun dengan fokus pada kualitas desain dan performa.
          </p>
        </div>
      </div>
    </footer>
  );
}
