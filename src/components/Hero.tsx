import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import HlsVideo from "./HlsVideo";
import { useMotion } from "../lib/motion";
import { useSound } from "../lib/sound";
import { scrollToSection } from "../lib/scrollTo";

export const HERO_VIDEO_SRC =
  "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";

const ROLES = ["Developer", "Video Editor", "Designer", "Founder"];

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const { motionEnabled } = useMotion();
  const { playWhoosh } = useSound();

  useEffect(() => {
    if (!motionEnabled) {
      if (contentRef.current) contentRef.current.style.transform = "";
      return;
    }
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(${nx * -14}px, ${ny * -9}px, 0)`;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [motionEnabled]);

  useEffect(() => {
    const interval = setInterval(
      () => setRoleIndex((i) => (i + 1) % ROLES.length),
      2000
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".name-reveal",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, delay: 0.1 }
      );
      tl.fromTo(
        ".blur-in",
        { opacity: 0, filter: "blur(10px)", y: 20 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, stagger: 0.1 },
        0.3
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background video — masked so it dissolves into the starfield below */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
        }}
      >
        <HlsVideo
          src={HERO_VIDEO_SRC}
          className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{ transition: "transform 0.3s ease-out" }}
      >
        <p className="blur-in text-xs text-muted uppercase tracking-[0.3em] mb-8">
          Collection '26
        </p>
        <h1 className="name-reveal text-6xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-6">
          Nadir Bakhti
        </h1>
        <p className="blur-in text-sm md:text-base text-muted mb-4">
          A{" "}
          <span
            key={roleIndex}
            className="font-display italic text-text-primary animate-role-fade-in inline-block"
          >
            {ROLES[roleIndex]}
          </span>{" "}
          lives in Algeria.
        </p>
        <p className="blur-in text-sm md:text-base text-muted max-w-md mb-12">
          I build apps, websites and video content that turn attention into
          revenue — powered by AI-driven workflows.
        </p>

        <div className="blur-in inline-flex gap-4">
          <a
            href="#work"
            onClick={(e) => {
              e.preventDefault();
              if (motionEnabled) {
                playWhoosh();
                scrollToSection("#work");
              } else {
                document
                  .querySelector("#work")
                  ?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="group relative rounded-full text-sm transition-transform duration-300 hover:scale-105"
          >
            <span className="absolute -inset-[2px] rounded-full accent-gradient-animated opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative block rounded-full px-7 py-3.5 bg-text-primary text-bg group-hover:bg-bg group-hover:text-text-primary transition-colors duration-300">
              See Works
            </span>
          </a>
          <a
            href="mailto:nadirbakhtics@gmail.com"
            className="group relative rounded-full text-sm transition-transform duration-300 hover:scale-105"
          >
            <span className="absolute -inset-[2px] rounded-full accent-gradient-animated opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative block rounded-full px-7 py-3.5 border-2 border-stroke bg-bg text-text-primary group-hover:border-transparent transition-colors duration-300">
              Reach out...
            </span>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        <span className="text-xs text-muted uppercase tracking-[0.2em]">
          Scroll
        </span>
        <span className="relative block w-px h-10 bg-stroke overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-text-primary animate-scroll-down" />
        </span>
      </div>
    </section>
  );
};

export default Hero;
