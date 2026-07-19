import { motion } from "framer-motion";
import SectionHeader from "./SectionHeader";

const EXPERIENCE = [
  {
    role: "Software Developer",
    company: "Independent",
    period: "Now",
    points: [
      "Built a white-label desktop management app covering orders, sales and daily operations — branded per client with a companion mobile app, first deployed for the pizzeria PIZZA UP.",
      "Created an automated video generator that turns a script into a finished vertical short — AI voice-over, stock footage, word-by-word captions and music, zero manual editing.",
      "Designed and shipped RILASSI — an e-commerce website for a Swiss gym-clothing dropshipping brand.",
      "Deep mastery of Claude, Claude Code and AI-driven development workflows.",
    ],
  },
  {
    role: "Video Editor",
    company: "French Dropshipping Company",
    period: "Remote",
    points: [
      "Created promotional video edits for products.",
      "Formatted videos for social media platforms.",
      "Followed marketing guidelines under tight deadlines.",
    ],
  },
  {
    role: "Dropshipping",
    company: "Independent",
    period: "E-commerce",
    points: [
      "Managed online stores end to end.",
      "Product research and market analysis.",
      "Content creation and order management.",
      "Designed logos and brand visuals for online stores.",
    ],
  },
  {
    role: "Cyber Café Assistant",
    company: "Algeria",
    period: "4 months",
    points: [
      "Customer assistance and front-desk service.",
      "Computer setup and basic troubleshooting.",
      "Printing, scanning, digital services and cash handling.",
    ],
  },
];

const SKILLS = [
  "Software Development",
  "Claude & Claude Code",
  "AI Workflows",
  "Video Editing",
  "Logo Design",
  "E-commerce & Dropshipping",
  "Advanced Computer Literacy",
  "Canva",
  "Fast Learner & Autonomous",
  "Athletic Discipline",
];

const EDUCATION = [
  {
    title: "Biomedical Engineering",
    detail: "Bachelor Level — Year 3",
  },
  {
    title: "Python for Everybody",
    detail: "Coursera — Python programming fundamentals",
  },
];

const LANGUAGES = ["French", "English", "Arabic"];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 1, delay, ease: [0.25, 0.1, 0.25, 1] as const },
  viewport: { once: true, margin: "-100px" },
});

const Resume = () => (
  <section id="resume" className="py-16 md:py-24">
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
      <SectionHeader
        eyebrow="Resume"
        title={
          <>
            The story <span className="font-display italic">so far</span>
          </>
        }
        subtext="Versatile and results-oriented — from e-commerce, video editing and logo design to building software with AI at the center of my workflow. Based in Oran, Algeria."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14">
        {/* Experience timeline */}
        <div className="md:col-span-7">
          <ol className="relative border-l border-stroke">
            {EXPERIENCE.map((job, i) => (
              <motion.li key={job.role} {...fadeUp(i * 0.08)} className="relative pl-8 pb-12 last:pb-0">
                <span className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full accent-gradient" />
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                  <h3 className="text-lg md:text-xl text-text-primary">
                    {job.role}
                  </h3>
                  <span className="text-sm font-display italic text-muted">
                    {job.company}
                  </span>
                  <span className="ml-auto text-xs text-muted uppercase tracking-[0.15em]">
                    {job.period}
                  </span>
                </div>
                <ul className="flex flex-col gap-1.5 mt-3">
                  {job.points.map((point) => (
                    <li key={point} className="text-sm text-muted leading-relaxed">
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Skills / Education / Languages */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <motion.div
            {...fadeUp(0.1)}
            className="bg-surface/30 border border-stroke rounded-3xl p-6 md:p-8"
          >
            <h3 className="text-xs text-muted uppercase tracking-[0.3em] mb-5">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((skill) => (
                <span
                  key={skill}
                  className="text-xs text-text-primary/80 border border-stroke bg-surface rounded-full px-3.5 py-2"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.2)}
            className="bg-surface/30 border border-stroke rounded-3xl p-6 md:p-8"
          >
            <h3 className="text-xs text-muted uppercase tracking-[0.3em] mb-5">
              Education
            </h3>
            <div className="flex flex-col gap-5">
              {EDUCATION.map((entry) => (
                <div key={entry.title}>
                  <p className="text-base text-text-primary">{entry.title}</p>
                  <p className="text-sm text-muted mt-0.5">{entry.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.3)}
            className="bg-surface/30 border border-stroke rounded-3xl p-6 md:p-8"
          >
            <h3 className="text-xs text-muted uppercase tracking-[0.3em] mb-5">
              Languages
            </h3>
            <div className="flex flex-col gap-4">
              {LANGUAGES.map((lang) => (
                <div key={lang} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-text-primary w-20">{lang}</span>
                  <span className="flex-1 h-1 rounded-full bg-stroke overflow-hidden">
                    <span className="block h-full w-full accent-gradient" />
                  </span>
                  <span className="text-xs text-muted">Fluent</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);

export default Resume;
