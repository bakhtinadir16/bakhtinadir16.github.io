import { motion } from "framer-motion";
import SectionHeader, { GradientPillButton } from "./SectionHeader";
import { useMotion } from "../lib/motion";
import { useSound } from "../lib/sound";
import { scrollToSection } from "../lib/scrollTo";

interface Project {
  title: string;
  image: string;
  span: string;
  aspect: string;
  // set this to make the card a real link
  href?: string;
}

const PROJECTS: Project[] = [
  {
    title: "Software Development",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    span: "md:col-span-7",
    aspect: "aspect-[16/10]",
  },
  {
    title: "Video Editing",
    image:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
    span: "md:col-span-5",
    aspect: "aspect-[16/10] md:aspect-auto",
  },
  {
    title: "AI Artistry",
    image: "/human-perspective.png",
    span: "md:col-span-5",
    aspect: "aspect-[16/10] md:aspect-auto",
  },
  {
    title: "Brand & Logo Design",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
    span: "md:col-span-7",
    aspect: "aspect-[16/10]",
  },
];

const Works = () => {
  const { motionEnabled } = useMotion();
  const { playWhoosh } = useSound();

  const goToPlayground = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (motionEnabled) {
      playWhoosh();
      scrollToSection("#playground");
    } else {
      document
        .querySelector("#playground")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
  <section id="work" className="py-12 md:py-16">
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
      <SectionHeader
        eyebrow="Selected Work"
        title={
          <>
            Featured <span className="font-display italic">projects</span>
          </>
        }
        subtext="A selection of projects I've worked on, from concept to launch."
        action={
          <GradientPillButton
            className="hidden md:inline-flex"
            href="#playground"
            onClick={goToPlayground}
          >
            View all work
          </GradientPillButton>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
        {PROJECTS.map((project, i) => (
          <motion.a
            key={project.title}
            href={project.href ?? "#work"}
            target={project.href ? "_blank" : undefined}
            rel={project.href ? "noreferrer" : undefined}
            onClick={project.href ? undefined : (e) => e.preventDefault()}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: i * 0.08,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            viewport={{ once: true, margin: "-100px" }}
            className={`group relative overflow-hidden bg-surface border border-stroke rounded-3xl ${project.span} ${project.aspect}`}
          >
            <img
              src={project.image}
              alt={project.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Halftone overlay */}
            <div
              className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #000 1px, transparent 1px)",
                backgroundSize: "4px 4px",
              }}
            />
            {/* Title pill on mobile, no hover on touch */}
            <div className="md:hidden absolute bottom-3 left-3">
              <span className="inline-block rounded-full bg-bg/70 backdrop-blur-md border border-white/10 text-text-primary text-xs px-3.5 py-1.5">
                <span className="font-display italic">{project.title}</span>
              </span>
            </div>
            {/* Hover overlay (desktop) */}
            <div className="absolute inset-0 hidden md:flex items-center justify-center bg-bg/70 backdrop-blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <span className="relative rounded-full">
                <span className="absolute -inset-[2px] rounded-full accent-gradient-animated" />
                <span className="relative block rounded-full bg-white text-black text-sm px-6 py-3">
                  <span className="font-display italic">{project.title}</span>
                </span>
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  </section>
  );
};

export default Works;
