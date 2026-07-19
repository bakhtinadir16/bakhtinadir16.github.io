import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type MotionPreference = "full" | "calm";

const STORAGE_KEY = "motion-preference";

interface MotionContextValue {
  motionEnabled: boolean;
  preference: MotionPreference;
  setPreference: (preference: MotionPreference) => void;
}

const MotionContext = createContext<MotionContextValue>({
  motionEnabled: true,
  preference: "full",
  setPreference: () => {},
});

export const MotionProvider = ({ children }: { children: ReactNode }) => {
  const [preference, setPreferenceState] = useState<MotionPreference>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "full" || saved === "calm") return saved;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "calm"
      : "full";
  });

  const setPreference = useCallback((next: MotionPreference) => {
    setPreferenceState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return (
    <MotionContext.Provider
      value={{ motionEnabled: preference === "full", preference, setPreference }}
    >
      {children}
    </MotionContext.Provider>
  );
};

export const useMotion = () => useContext(MotionContext);
