import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "../lib/sound";

const WORDS = ["Design", "Create", "Inspire"];
const DURATION = 2700;

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [done, setDone] = useState(false);
  const rafRef = useRef(0);
  const { playLoading } = useSound();

  // Play the loading swoosh immediately when the browser allows autoplay
  // (e.g. returning visitors); otherwise start it on the first gesture.
  // The audio context resumes asynchronously after a gesture, so retry a
  // few times instead of checking once and giving up.
  useEffect(() => {
    const mountedAt = performance.now();
    let started = false;
    let retryTimer = 0;
    const tryPlay = () => {
      if (started) return true;
      const remaining = DURATION - (performance.now() - mountedAt) + 400;
      if (remaining > 400 && playLoading(remaining)) started = true;
      return started;
    };
    if (tryPlay()) return;
    let attempts = 0;
    const retry = () => {
      if (tryPlay() || ++attempts > 12) return;
      retryTimer = window.setTimeout(retry, 100);
    };
    const onGesture = () => {
      attempts = 0;
      clearTimeout(retryTimer);
      retry();
    };
    // Retry right away too: when autoplay is allowed, the context resumes
    // asynchronously a moment after mount — no gesture ever arrives.
    retry();
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    window.addEventListener("touchend", onGesture);
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("touchend", onGesture);
      clearTimeout(retryTimer);
    };
  }, [playLoading]);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1);
      setCount(Math.round(progress * 100));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setDone(true);
          setTimeout(onComplete, 500);
        }, 400);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(
      () => setWordIndex((i) => (i + 1) % WORDS.length),
      900
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-bg"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <motion.span
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-8 left-8 text-xs text-muted uppercase tracking-[0.3em]"
          >
            Portfolio
          </motion.span>

          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary/80"
              >
                {WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="absolute bottom-10 right-8 md:bottom-14 md:right-14">
            <span className="text-6xl md:text-8xl lg:text-9xl font-display text-text-primary tabular-nums">
              {String(count).padStart(3, "0")}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-stroke/50">
            <div
              className="h-full accent-gradient origin-left transition-transform duration-100 ease-linear"
              style={{
                transform: `scaleX(${count / 100})`,
                boxShadow: "0 0 8px rgba(137, 170, 204, 0.35)",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
