import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMotion } from "./motion";

type SoundPref = "auto" | "on" | "off";

const STORAGE_KEY = "sound-preference";

/**
 * All sounds are synthesized live with the Web Audio API — no audio files.
 * Browsers only allow audio after the first user gesture, so everything is
 * gated behind `interacted`.
 */
class SpaceAudioEngine {
  interacted = false;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambient: { gain: GainNode; stops: (() => void)[] } | null = null;

  private ensure(): AudioContext | null {
    if (!this.ctx) {
      if (typeof AudioContext === "undefined") return null;
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.6;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /** Attempt to start the audio context without a gesture. Succeeds when the
   *  browser already trusts the site (site setting / media engagement). */
  async tryResume(): Promise<boolean> {
    const ctx = this.ensure();
    if (!ctx) return false;
    if (ctx.state !== "running") {
      try {
        await ctx.resume();
      } catch {
        // Autoplay blocked — the gesture listeners will unlock later.
      }
    }
    return ctx.state === "running";
  }

  /** Soft, satisfying "pop" — like a gentle bubble tap. */
  click() {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    if (ctx.state !== "running") {
      // Resume is async; retry once it completes so the first click isn't silent
      void ctx.resume().then(() => {
        if (ctx.state === "running") this.click();
      });
      return;
    }
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.05);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.13, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  /** Airy whoosh for traveling between sections. */
  whoosh() {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const dur = 1.1;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 1.1;
    filter.frequency.setValueAtTime(160, t);
    filter.frequency.exponentialRampToValueAtTime(950, t + dur * 0.45);
    filter.frequency.exponentialRampToValueAtTime(170, t + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.16, t + dur * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t);
    src.stop(t + dur);
  }

  /** Airy rising swoosh that tracks the loading bar. Returns whether audio
   *  actually started (browsers block sound before a user gesture). */
  loadingSweep(durationMs: number): boolean {
    const ctx = this.ensure();
    if (!ctx || !this.master || ctx.state !== "running") return false;
    const t = ctx.currentTime;
    const dur = Math.max(durationMs / 1000, 0.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.04, t + Math.min(0.8, dur * 0.4));
    gain.gain.setValueAtTime(0.04, t + Math.max(dur - 0.4, 0.4));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    gain.connect(this.master);

    // Airy shimmer: narrow-band noise gliding gently upward with the bar
    const buffer = ctx.createBuffer(
      1,
      Math.ceil(ctx.sampleRate * dur),
      ctx.sampleRate
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 2.2;
    filter.frequency.setValueAtTime(420, t);
    filter.frequency.exponentialRampToValueAtTime(2100, t + dur);
    noise.connect(filter);
    filter.connect(gain);
    noise.start(t);
    noise.stop(t + dur);

    // Barely-there sine glide underneath, softening the noise
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + dur);
    oscGain.gain.setValueAtTime(0.12, t);
    oscGain.gain.setValueAtTime(0.12, t + Math.max(dur - 0.4, 0.4));
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(oscGain);
    oscGain.connect(gain);
    osc.start(t);
    osc.stop(t + dur);

    // Soft two-note "ready" chime as the bar completes
    const chimeAt = t + Math.max(dur - 0.05, 0);
    [660, 990].forEach((freq, i) => {
      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bell.type = "sine";
      bell.frequency.value = freq;
      const start = chimeAt + i * 0.12;
      bellGain.gain.setValueAtTime(0.0001, start);
      bellGain.gain.exponentialRampToValueAtTime(0.035, start + 0.02);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.7);
      bell.connect(bellGain);
      bellGain.connect(this.master!);
      bell.start(start);
      bell.stop(start + 0.75);
    });

    return true;
  }

  /**
   * Looped ambient music: a soft Cmaj7 → Am7 → Fmaj7 → Gadd9 pad progression
   * with sparse plucked notes echoing through a space delay. Notes are chosen
   * with light randomness so the loop never repeats exactly.
   */
  startAmbient() {
    const ctx = this.ensure();
    if (!ctx || !this.master || this.ambient) return;
    const t = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.07, t + 3);
    gain.connect(this.master);
    const stops: (() => void)[] = [];

    // Space echo bus shared by the plucks
    const delay = ctx.createDelay(1.5);
    delay.delayTime.value = 0.42;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.38;
    const feedbackFilter = ctx.createBiquadFilter();
    feedbackFilter.type = "lowpass";
    feedbackFilter.frequency.value = 1800;
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    delay.connect(feedbackFilter);
    feedbackFilter.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(gain);

    const CHORDS = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0], // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 440.0], // Gadd9
    ];
    const CHORD_DURATION = 4.5;

    const schedulePad = (chord: number[], at: number) => {
      // Sub-bass root one octave down grounds each chord
      const notes = [chord[0] / 2, ...chord];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const vol = i === 0 ? 0.16 : 0.075;
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(vol, at + 1.4);
        g.gain.setValueAtTime(vol, at + CHORD_DURATION - 1.2);
        g.gain.exponentialRampToValueAtTime(0.0001, at + CHORD_DURATION + 0.6);
        osc.connect(g);
        g.connect(gain);
        osc.start(at);
        osc.stop(at + CHORD_DURATION + 0.8);
      });
    };

    const schedulePlucks = (chord: number[], at: number) => {
      const slots = Math.floor(CHORD_DURATION / 0.75);
      for (let i = 0; i < slots; i++) {
        if (Math.random() > 0.4) continue;
        const noteAt = at + i * 0.75 + Math.random() * 0.1;
        const base = chord[Math.floor(Math.random() * chord.length)];
        const freq = base * (Math.random() > 0.5 ? 2 : 4);
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, noteAt);
        g.gain.exponentialRampToValueAtTime(0.05, noteAt + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, noteAt + 1);
        osc.connect(g);
        g.connect(gain);
        g.connect(delay);
        osc.start(noteAt);
        osc.stop(noteAt + 1.1);
      }
    };

    // Look-ahead scheduler keeps the loop sample-accurate without long timers
    let chordIndex = 0;
    let nextChordAt = ctx.currentTime + 0.1;
    const tick = () => {
      while (nextChordAt < ctx.currentTime + 2) {
        const chord = CHORDS[chordIndex % CHORDS.length];
        schedulePad(chord, nextChordAt);
        schedulePlucks(chord, nextChordAt);
        chordIndex++;
        nextChordAt += CHORD_DURATION;
      }
    };
    tick();
    const timer = setInterval(tick, 600);
    stops.push(() => clearInterval(timer));

    this.ambient = { gain, stops };
  }

  stopAmbient() {
    if (!this.ctx || !this.ambient) return;
    const { gain, stops } = this.ambient;
    this.ambient = null;
    const t = this.ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    setTimeout(() => {
      stops.forEach((stop) => stop());
      gain.disconnect();
    }, 500);
  }
}

const engine = new SpaceAudioEngine();

// DEV-only hook (like __forceWarp): the in-app preview can't click, so
// tooling inspects unlock state through this instead.
if (import.meta.env.DEV) {
  (window as unknown as { __soundEngine?: SpaceAudioEngine }).__soundEngine =
    engine;
}

// Without this, Vite HMR orphans the old engine mid-song and the mute
// button can no longer reach it.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    engine.stopAmbient();
  });
}

interface SoundContextValue {
  soundOn: boolean;
  setSoundPref: (pref: "on" | "off") => void;
  playWhoosh: () => void;
  playLoading: (durationMs: number) => boolean;
}

const SoundContext = createContext<SoundContextValue>({
  soundOn: false,
  setSoundPref: () => {},
  playWhoosh: () => {},
  playLoading: () => false,
});

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const { motionEnabled } = useMotion();
  const [pref, setPref] = useState<SoundPref>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "on" || saved === "off" ? saved : "auto";
  });

  // Sound follows the motion preference until the visitor chooses explicitly.
  const soundOn = pref === "auto" ? motionEnabled : pref === "on";
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;

  // Try to start audio with zero clicks. Browsers allow this when the visitor
  // has granted sound for the site (or visits often); resume() settles
  // asynchronously, so poll briefly instead of checking once.
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const attempt = () => {
      if (cancelled || engine.interacted) return;
      void engine.tryResume().then((running) => {
        if (cancelled || engine.interacted) return;
        if (running) {
          engine.interacted = true;
          if (soundOnRef.current) engine.startAmbient();
        } else if (++attempts < 8) {
          setTimeout(attempt, 150);
        }
      });
    };
    attempt();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fallback: unlock on the first gesture of any kind, not just a click.
  useEffect(() => {
    const unlock = () => {
      engine.interacted = true;
      if (soundOnRef.current) engine.startAmbient();
    };
    const onPointerDown = () => {
      unlock();
      if (soundOnRef.current) engine.click();
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchend", unlock);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchend", unlock);
    };
  }, []);

  useEffect(() => {
    if (soundOn && engine.interacted) engine.startAmbient();
    if (!soundOn) engine.stopAmbient();
  }, [soundOn]);

  const setSoundPref = useCallback((next: "on" | "off") => {
    setPref(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const playWhoosh = useCallback(() => {
    if (soundOnRef.current) engine.whoosh();
  }, []);

  const playLoading = useCallback((durationMs: number) => {
    if (!soundOnRef.current) return false;
    return engine.loadingSweep(durationMs);
  }, []);

  return (
    <SoundContext.Provider
      value={{ soundOn, setSoundPref, playWhoosh, playLoading }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
