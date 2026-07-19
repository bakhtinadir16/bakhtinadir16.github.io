import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  subtext: string;
  action?: ReactNode;
}

const SectionHeader = ({
  eyebrow,
  title,
  subtext,
  action,
}: SectionHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
    viewport={{ once: true, margin: "-100px" }}
    className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
  >
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-px bg-stroke" />
        <span className="text-xs text-muted uppercase tracking-[0.3em]">
          {eyebrow}
        </span>
      </div>
      <h2 className="text-3xl md:text-5xl text-text-primary mb-3">{title}</h2>
      <p className="text-sm md:text-base text-muted max-w-md">{subtext}</p>
    </div>
    {action}
  </motion.div>
);

export const GradientPillButton = ({
  children,
  href = "#",
  className = "",
  onClick,
}: {
  children: ReactNode;
  href?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) => (
  <a
    href={href}
    onClick={onClick}
    target={href.startsWith("http") ? "_blank" : undefined}
    rel={href.startsWith("http") ? "noreferrer" : undefined}
    className={`group relative rounded-full text-sm shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
  >
    <span className="absolute -inset-[2px] rounded-full accent-gradient-animated opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <span className="relative flex items-center gap-2 rounded-full px-6 py-3 bg-surface border border-stroke group-hover:border-transparent text-text-primary transition-colors duration-300">
      {children} <span aria-hidden>→</span>
    </span>
  </a>
);

export default SectionHeader;
