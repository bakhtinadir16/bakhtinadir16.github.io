import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMotion, type MotionPreference } from "../lib/motion";
import { useSound } from "../lib/sound";

const OPTIONS: { value: MotionPreference; label: string; hint: string }[] = [
  {
    value: "full",
    label: "Full experience",
    hint: "Warp speed, meteors & astronaut",
  },
  {
    value: "calm",
    label: "Reduced motion",
    hint: "Calm, gentle starfield",
  },
];

const SOUND_OPTIONS: { value: "on" | "off"; label: string; hint: string }[] = [
  {
    value: "on",
    label: "Sound on",
    hint: "Ambient space & interactions",
  },
  {
    value: "off",
    label: "Muted",
    hint: "Complete silence",
  },
];

const MotionToggle = () => {
  const { preference, setPreference } = useMotion();
  const { soundOn, setSoundPref } = useSound();
  const [open, setOpen] = useState(false);
  const [guiding, setGuiding] = useState(false);
  const [highlightFull, setHighlightFull] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const guideTimers = useRef<number[]>([]);

  // fired by the toast: pulse the button, open the panel, highlight "Full"
  useEffect(() => {
    const onGuide = () => {
      setGuiding(true);
      guideTimers.current.push(
        window.setTimeout(() => {
          setGuiding(false);
          setOpen(true);
          setHighlightFull(true);
        }, 1600)
      );
      guideTimers.current.push(
        window.setTimeout(() => setHighlightFull(false), 10000)
      );
    };
    window.addEventListener("guide-motion-menu", onGuide);
    return () => {
      window.removeEventListener("guide-motion-menu", onGuide);
      guideTimers.current.forEach(clearTimeout);
    };
  }, []);

  // once full motion is on, kill the guide visuals and any pending timers
  useEffect(() => {
    if (preference !== "full") return;
    guideTimers.current.forEach(clearTimeout);
    guideTimers.current = [];
    setGuiding(false);
    setHighlightFull(false);
  }, [preference]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed top-5 right-3 md:top-6 md:right-6 z-[70]"
    >
      <AnimatePresence>
        {guiding && (
          <motion.span
            initial={{ opacity: 0.9, scale: 1 }}
            animate={{ opacity: 0, scale: 2.1 }}
            // exit needs its own transition or it inherits repeat: Infinity
            // and the ring never goes away
            exit={{ opacity: 0, transition: { duration: 0.25, repeat: 0 } }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
            className="absolute top-0 right-0 w-11 h-11 rounded-full accent-gradient pointer-events-none"
          />
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Experience settings"
        aria-expanded={open}
        className="flex flex-col items-center justify-center gap-[5px] w-11 h-11 rounded-full bg-surface border border-white/10 backdrop-blur-md hover:border-white/25 transition-colors duration-300"
      >
        <span
          className={`block h-[1.5px] w-[18px] bg-text-primary rounded-full transition-transform duration-300 ${
            open ? "translate-y-[6.5px] rotate-45" : ""
          }`}
        />
        <span
          className={`block h-[1.5px] w-[18px] bg-text-primary rounded-full transition-opacity duration-200 ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-[1.5px] w-[18px] bg-text-primary rounded-full transition-transform duration-300 ${
            open ? "-translate-y-[6.5px] -rotate-45" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-64 rounded-2xl bg-surface border border-stroke p-2 shadow-xl shadow-black/50 backdrop-blur-md"
          >
            <p className="text-[10px] text-muted uppercase tracking-[0.25em] px-3 pt-2 pb-1.5">
              Experience
            </p>
            {OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setPreference(option.value)}
                className={`w-full text-left rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  preference === option.value
                    ? "bg-stroke/60"
                    : "hover:bg-stroke/40"
                } ${
                  highlightFull && option.value === "full" ? "guide-glow" : ""
                }`}
              >
                <span className="flex items-center justify-between text-sm text-text-primary">
                  {option.label}
                  {preference === option.value && (
                    <span className="w-1.5 h-1.5 rounded-full accent-gradient" />
                  )}
                </span>
                <span className="block text-xs text-muted mt-0.5">
                  {option.hint}
                </span>
              </button>
            ))}

            <p className="text-[10px] text-muted uppercase tracking-[0.25em] px-3 pt-3 pb-1.5 border-t border-stroke mt-2">
              Sound
            </p>
            {SOUND_OPTIONS.map((option) => {
              const selected = soundOn === (option.value === "on");
              return (
                <button
                  key={option.value}
                  onClick={() => setSoundPref(option.value)}
                  className={`w-full text-left rounded-xl px-3 py-2.5 transition-colors duration-200 ${
                    selected ? "bg-stroke/60" : "hover:bg-stroke/40"
                  }`}
                >
                  <span className="flex items-center justify-between text-sm text-text-primary">
                    {option.label}
                    {selected && (
                      <span className="w-1.5 h-1.5 rounded-full accent-gradient" />
                    )}
                  </span>
                  <span className="block text-xs text-muted mt-0.5">
                    {option.hint}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MotionToggle;
