import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMotion } from "../lib/motion";

const SHOW_AFTER_MS = 4500;
const VISIBLE_FOR_MS = 12000;

// Toast shown once per session when motion is off. "Show me how" hands off
// to MotionToggle.
const MotionSuggestion = () => {
  const { motionEnabled } = useMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (motionEnabled) return;
    if (sessionStorage.getItem("motion-suggestion-seen")) return;
    const showTimer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem("motion-suggestion-seen", "1");
    }, SHOW_AFTER_MS);
    const hideTimer = setTimeout(
      () => setVisible(false),
      SHOW_AFTER_MS + VISIBLE_FOR_MS
    );
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [motionEnabled]);

  const accept = () => {
    setVisible(false);
    window.dispatchEvent(new Event("guide-motion-menu"));
  };

  return (
    <div className="fixed inset-x-0 bottom-6 z-[65] flex justify-center px-4 pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="pointer-events-auto relative max-w-sm rounded-2xl"
          >
            <span className="absolute -inset-[1px] rounded-2xl accent-gradient-animated opacity-60" />
            <div className="relative bg-surface rounded-2xl p-4 shadow-xl shadow-black/50">
              <p className="text-sm text-text-primary mb-1">
                You're seeing the{" "}
                <span className="font-display italic">calm</span> version.
              </p>
              <p className="text-xs text-muted mb-3">
                This site has a full cinematic mode — warp speed, shooting
                stars and a floating astronaut. Want to try it?
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={accept}
                  className="text-xs rounded-full px-4 py-2 bg-text-primary text-bg hover:scale-105 transition-transform duration-200"
                >
                  Show me how
                </button>
                <button
                  onClick={() => setVisible(false)}
                  className="text-xs text-muted hover:text-text-primary transition-colors duration-200"
                >
                  No thanks
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MotionSuggestion;
