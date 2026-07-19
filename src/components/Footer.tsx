import { useEffect, useRef } from "react";
import gsap from "gsap";
import HlsVideo from "./HlsVideo";
import { HERO_VIDEO_SRC } from "./Hero";

const SOCIALS = [
  { label: "Twitter", href: "https://x.com/tittour_" },
  { label: "Instagram", href: "https://www.instagram.com/nadirbakhti_" },
  { label: "WhatsApp", href: "https://wa.me/33783189238" },
  { label: "GitHub", href: "https://github.com/bakhtinadir16" },
];

const Footer = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tween = gsap.to(marqueeRef.current, {
      xPercent: -50,
      duration: 40,
      ease: "none",
      repeat: -1,
    });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <footer className="relative pt-16 md:pt-20 pb-8 md:pb-12 overflow-hidden">
      {/* Background video (flipped) — masked so the starfield dissolves into it */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to top, black 0%, black 55%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, black 55%, transparent 100%)",
        }}
      >
        <HlsVideo
          src={HERO_VIDEO_SRC}
          className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 scale-y-[-1]"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10">
        {/* Marquee */}
        <div className="overflow-hidden whitespace-nowrap mb-16 md:mb-24">
          <div ref={marqueeRef} className="inline-block will-change-transform">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className="text-5xl md:text-7xl lg:text-8xl font-display italic text-text-primary/90 tracking-tight"
              >
                BUILDING THE FUTURE&nbsp;•&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center text-center gap-6 mb-20 md:mb-28 px-6">
          <p className="text-xs text-muted uppercase tracking-[0.3em]">
            Have an idea?
          </p>
          <a
            href="mailto:nadirbakhtics@gmail.com"
            className="group relative rounded-full text-base md:text-lg"
          >
            <span className="absolute -inset-[2px] rounded-full accent-gradient-animated opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2 rounded-full px-8 py-4 bg-surface border border-stroke group-hover:border-transparent text-text-primary transition-colors duration-300">
              nadirbakhtics@gmail.com <span aria-hidden>↗</span>
            </span>
          </a>
        </div>

        {/* Footer bar */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-stroke">
            <ul className="flex items-center gap-6">
              {SOCIALS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-muted hover:text-text-primary transition-colors uppercase tracking-[0.15em]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-green-500 opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-green-500" />
              </span>
              <span className="text-xs text-muted">
                Available for projects
              </span>
            </div>
          </div>
          <p className="text-center text-xs text-muted/60 mt-8">
            © 2026 Nadir Bakhti. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
