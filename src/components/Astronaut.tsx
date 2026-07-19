import { useEffect, useRef } from "react";
import { useMotion } from "../lib/motion";

const Astronaut = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { motionEnabled } = useMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!motionEnabled) {
      el.style.opacity = "0";
      return;
    }

    let raf = 0;
    let startAt = performance.now() + 4000 + Math.random() * 6000;
    let duration = 0;
    let fromLeft = true;
    let baseY = 0;
    let spin = 0;

    const schedule = () => {
      startAt = performance.now() + 10000 + Math.random() * 20000;
      fromLeft = Math.random() > 0.5;
      baseY = window.innerHeight * (0.15 + Math.random() * 0.5);
      duration = 30000 + Math.random() * 15000;
      spin = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 30);
    };
    fromLeft = Math.random() > 0.5;
    baseY = window.innerHeight * (0.15 + Math.random() * 0.5);
    duration = 34000;
    spin = 40;

    const loop = (now: number) => {
      const progress = (now - startAt) / duration;
      if (progress < 0) {
        el.style.opacity = "0";
      } else if (progress >= 1) {
        schedule();
        el.style.opacity = "0";
      } else {
        const travel = window.innerWidth + 320;
        const x = fromLeft
          ? -160 + progress * travel
          : window.innerWidth + 160 - progress * travel;
        const y =
          baseY +
          Math.sin(progress * Math.PI * 5) * 36 +
          Math.sin(progress * Math.PI * 2) * 20;
        const rotation = (fromLeft ? 1 : -1) * (progress * spin - spin / 2);
        el.style.opacity = String(Math.min(Math.sin(progress * Math.PI) * 2, 0.95));
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, [motionEnabled]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed top-0 left-0 -z-10 pointer-events-none will-change-transform"
      style={{ opacity: 0 }}
    >
      <svg width="96" height="116" viewBox="0 0 110 130" fill="none">
        {/* backpack */}
        <rect x="16" y="36" width="26" height="38" rx="7" fill="#aab2bf" />
        {/* arms */}
        <rect
          x="20"
          y="44"
          width="13"
          height="32"
          rx="6.5"
          fill="#d3d7de"
          transform="rotate(24 26.5 60)"
        />
        <rect
          x="74"
          y="44"
          width="13"
          height="32"
          rx="6.5"
          fill="#d3d7de"
          transform="rotate(-28 80.5 60)"
        />
        {/* legs */}
        <rect
          x="35"
          y="80"
          width="13"
          height="36"
          rx="6.5"
          fill="#d3d7de"
          transform="rotate(10 41.5 98)"
        />
        <rect
          x="57"
          y="80"
          width="13"
          height="36"
          rx="6.5"
          fill="#d3d7de"
          transform="rotate(-16 63.5 98)"
        />
        {/* body */}
        <rect x="30" y="34" width="46" height="54" rx="17" fill="#e9ebef" />
        {/* chest panel */}
        <rect x="43" y="52" width="20" height="14" rx="3" fill="#7d8798" />
        <circle cx="48.5" cy="59" r="2.6" fill="#89AACC" />
        <circle cx="58" cy="59" r="2.6" fill="#4E85BF" />
        {/* helmet */}
        <circle cx="53" cy="25" r="20" fill="#e9ebef" />
        <ellipse cx="56" cy="25" rx="13.5" ry="11" fill="#141a26" />
        <path
          d="M49 18 q7 -5 13 2"
          stroke="#89AACC"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.65"
        />
      </svg>
    </div>
  );
};

export default Astronaut;
