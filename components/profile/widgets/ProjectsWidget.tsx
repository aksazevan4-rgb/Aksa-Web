"use client";

import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export interface ProjectItem {
  title: string;
  description?: string;
  url?: string;
  repoUrl?: string;
  tags?: string[];
  status?: "active" | "archived" | "wip";
}

interface Props {
  projects: ProjectItem[];
  accentHex?: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
  archived: "text-text-tertiary bg-white/5 border-border",
  wip: "text-amber-300 bg-amber-400/10 border-amber-400/20",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  archived: "Archived",
  wip: "WIP",
};
function GitHub(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.094 3.292 9.407 7.86 10.933.575.106.785-.25.785-.556 0-.274-.01-1-.016-1.963-3.197.695-3.872-1.54-3.872-1.54-.523-1.328-1.277-1.681-1.277-1.681-1.044-.714.08-.7.08-.7 1.155.08 1.763 1.187 1.763 1.187 1.026 1.758 2.692 1.25 3.348.955.104-.744.402-1.25.731-1.538-2.553-.29-5.238-1.277-5.238-5.684 0-1.256.45-2.283 1.186-3.088-.119-.291-.514-1.462.113-3.048 0 0 .967-.31 3.17 1.18a10.99 10.99 0 0 1 5.77 0c2.201-1.49 3.166-1.18 3.166-1.18.63 1.586.235 2.757.116 3.048.74.805 1.184 1.832 1.184 3.088 0 4.418-2.69 5.39-5.252 5.675.414.356.783 1.055.783 2.126 0 1.536-.014 2.775-.014 3.153 0 .31.206.668.792.554C20.213 21.403 23.5 17.092 23.5 12 23.5 5.648 18.352.5 12 .5Z" />
    </svg>
  );
}
/**
 * components/profile/widgets/ProjectsWidget.tsx
 */
export function ProjectsWidget({ projects, accentHex = "#9b6dff" }: Props) {
  return (
    <div className="space-y-3">
      {projects.map((project, i) => (
        <motion.div
          key={project.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="glass rounded-2xl p-5 space-y-3 group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-sm text-text-primary">{project.title}</h3>
                {project.status && (
                  <span
                    className={`text-[10px] rounded-full border px-2 py-0.5 font-mono ${
                      STATUS_STYLES[project.status] ?? STATUS_STYLES.active
                    }`}
                  >
                    {STATUS_LABELS[project.status] ?? project.status}
                  </span>
                )}
              </div>
              {project.description && (
                <p className="text-xs text-text-tertiary mt-1 leading-relaxed line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                  title="Repository"
              >
                <GitHub className="w-[15px] h-[15px]" />
              </a>
            )}
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                  title="Lihat project"
                >
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          </div>

          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] rounded-full px-2.5 py-0.5 border"
                  style={{
                    color: accentHex,
                    background: `${accentHex}12`,
                    borderColor: `${accentHex}30`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
