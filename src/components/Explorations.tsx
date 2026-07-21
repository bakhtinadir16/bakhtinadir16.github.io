import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GradientPillButton } from "./SectionHeader";

gsap.registerPlugin(ScrollTrigger);

const ITEMS: { image: string; rotation: number; position?: string }[] = [
  {
    image: "/pizzaup-dashboard.png",
    rotation: -4,
  },
  {
    image: "/rilassi-shot.jpg",
    rotation: 3,
  },
  {
    // The video generator's "Dual Channel Story Studio" web UI
    image: "/videogen-studio.png",
    rotation: -2,
    position: "50% 0%",
  },
  {
    // METRO logo — owner's brand/logo design work
    image: "/metro-logo.jpg",
    rotation: 5,
  },
  {
    image:
      "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=800&q=80",
    rotation: -3,
  },
  {
    image: "/exploration-portrait.png",
    rotation: 2,
  },
];

const leftColumn = ITEMS.filter((_, i) => i % 2 === 0);
const rightColumn = ITEMS.filter((_, i) => i % 2 === 1);

const Explorations = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    // Desktop travel distances empty the section far too early on a phone's
    // short viewport — scale the parallax down on small screens.
    const mobile = window.innerWidth < 768;
    const leftTravel = mobile ? -180 : -600;
    const rightFrom = mobile ? 100 : 200;
    const rightTravel = mobile ? -300 : -900;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: contentRef.current,
        pinSpacing: false,
      });

      gsap.fromTo(
        leftRef.current,
        { y: 0 },
        {
          y: leftTravel,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        rightRef.current,
        { y: rightFrom },
        {
          y: rightTravel,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const renderColumn = (
    items: typeof ITEMS,
    ref: React.RefObject<HTMLDivElement>,
    alignment: string
  ) => (
    <div ref={ref} className={`flex flex-col gap-10 md:gap-24 ${alignment}`}>
      {items.map((item) => (
        <button
          key={item.image}
          onClick={() => setLightbox(item.image)}
          className="group relative aspect-square w-full max-w-[320px] overflow-hidden rounded-3xl border border-stroke bg-surface transition-transform duration-500 hover:scale-105 hover:!rotate-0"
          style={{ transform: `rotate(${item.rotation}deg)` }}
        >
          <img
            src={item.image}
            alt="Visual exploration"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            style={item.position ? { objectPosition: item.position } : undefined}
          />
        </button>
      ))}
    </div>
  );

  // Mobile columns are much shorter, so the pinned stretch is shorter too
  // (min-h below) and the parallax travel is scaled down (see effect above).
  return (
    <section
      id="playground"
      ref={sectionRef}
      className="relative min-h-[150vh] md:min-h-[300vh]"
    >
      {/* Pinned center content */}
      <div
        ref={contentRef}
        className="h-screen flex items-center justify-center z-10"
      >
        <div className="flex flex-col items-center text-center px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">
              Explorations
            </span>
            <span className="w-8 h-px bg-stroke" />
          </div>
          <h2 className="text-4xl md:text-6xl text-text-primary mb-4">
            Visual <span className="font-display italic">playground</span>
          </h2>
          <p className="text-sm md:text-base text-muted max-w-md mb-8">
            A mix of shipped work, experiments, and studies — the pieces
            that taught me the most.
          </p>
          <GradientPillButton href="https://www.instagram.com/nadirbakhti_">
            Instagram
          </GradientPillButton>
        </div>
      </div>

      {/* Parallax columns */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="max-w-[1400px] mx-auto h-full px-6 md:px-12">
          <div className="grid grid-cols-2 gap-6 md:gap-40 pt-[60vh] [&_button]:pointer-events-auto">
            {renderColumn(leftColumn, leftRef, "items-start")}
            {renderColumn(rightColumn, rightRef, "items-end")}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/90 backdrop-blur-md cursor-zoom-out p-6"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={lightbox}
              alt="Visual exploration enlarged"
              className="max-w-full max-h-full rounded-3xl border border-stroke"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Explorations;
