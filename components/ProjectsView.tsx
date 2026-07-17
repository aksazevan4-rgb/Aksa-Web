"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { GitBranch, ExternalLink, MessageCircle, Star } from "lucide-react";

export interface ProjectViewData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  tags: string[];
  repoUrl: string | null;
  url: string | null;
  coverUrl: string | null;
  featured: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  building: "Building",
  archived: "Archived",
};

export default function ProjectsView({
  projects,
}: {
  projects: ProjectViewData[];
}) {
  return (
    <section id="projects" className="relative px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-mono text-xs text-purple tracking-widest uppercase mb-3">
            Proyek
          </p>
          <h2 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">
            Yang sudah dibangun dan dijaga tetap berjalan.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => {
            const statusKey = project.status.toLowerCase();
            const isDiscord = project.url?.includes("discord.gg");

            return (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="group flex flex-col glass rounded-2xl overflow-hidden hover:border-purple/40 transition-colors"
              >
                {project.coverUrl && (
                  <div className="relative aspect-video bg-white/5">
                    <Image
                      src={project.coverUrl}
                      alt={project.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-mono ${
                        statusKey === "active" ? "text-online" : "text-blue"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full animate-pulse-dot ${
                          statusKey === "active" ? "bg-online" : "bg-blue"
                        }`}
                      />
                      {STATUS_LABEL[statusKey] ?? project.status}
                    </span>
                    {project.featured && (
                      <Star
                        size={13}
                        className="text-yellow-400"
                        fill="currentColor"
                      />
                    )}
                  </div>

                  <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
                    {project.title}
                  </h3>
                  <p className="text-text-secondary text-[13px] leading-relaxed mb-5 flex-1">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[10.5px] text-text-secondary bg-white/5 rounded-md px-2 py-1"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-border/60">
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <GitBranch size={15} />
                        Code
                      </a>
                    )}
                    {project.url &&
                      (isDiscord ? (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
                        >
                          <MessageCircle size={15} />
                          Join Discord
                        </a>
                      ) : (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
                        >
                          <ExternalLink size={15} />
                          Live
                        </a>
                      ))}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
