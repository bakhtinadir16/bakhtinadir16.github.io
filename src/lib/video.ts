/**
 * Background-video autoplay helper.
 *
 * Mobile browsers make three things go wrong with the hero + footer loops:
 *   1. autoplay is blocked until the page has seen a real user gesture,
 *   2. the `autoplay` attribute is evaluated before hls.js attaches a source,
 *      so streamed videos never start at all,
 *   3. iOS only keeps a small number of videos decoding at once — with one
 *      loop at the top of the page and another at the bottom, waking one could
 *      leave the other stalled (tap the footer, the hero starts, and back).
 *
 * Every background video registers here so it is muted/inline before the first
 * attempt, retries on the first genuine gesture, and only decodes while it is
 * actually on screen — which keeps a single loop running at any time.
 */

interface Entry {
  visible: boolean;
}

const registry = new Map<HTMLVideoElement, Entry>();
let observer: IntersectionObserver | null = null;
let gesturesBound = false;

/** Autoplay policy: must be muted + inline *before* we ask it to play. */
const prepare = (video: HTMLVideoElement) => {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  // React sets these as properties; the attributes matter to iOS at load time.
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
};

const tryPlay = (video: HTMLVideoElement) => {
  if (!registry.get(video)?.visible) return;
  if (!video.paused) return;
  const p = video.play();
  // Still blocked (no gesture yet) — the gesture listener will try again.
  if (p && typeof p.catch === "function") p.catch(() => {});
};

const onGesture = () => {
  registry.forEach((_, video) => tryPlay(video));
};

const ensureGlobals = () => {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const record = registry.get(video);
          if (!record) return;
          record.visible = entry.isIntersecting;
          if (entry.isIntersecting) tryPlay(video);
          else if (!video.paused) video.pause();
        });
      },
      // Start a touch early so the loop is already running when it scrolls in.
      { rootMargin: "150px 0px", threshold: 0.01 }
    );
  }
  if (!gesturesBound) {
    gesturesBound = true;
    (["pointerdown", "touchend", "keydown"] as const).forEach((type) =>
      window.addEventListener(type, onGesture, { passive: true })
    );
  }
};

/**
 * Ask a registered video to play. Honours the visibility gate, so a source
 * that finishes loading while its section is off screen stays paused.
 */
export const requestPlay = (video: HTMLVideoElement) => tryPlay(video);

/**
 * Register a background video for gesture-aware, visibility-gated autoplay.
 * Returns a cleanup function for the calling effect.
 */
export const registerAutoplayVideo = (video: HTMLVideoElement) => {
  ensureGlobals();
  prepare(video);
  registry.set(video, { visible: false });
  observer!.observe(video);

  // A source can arrive well after mount (hls.js/MSE), so play once it has data.
  const onReady = () => tryPlay(video);
  video.addEventListener("loadeddata", onReady);
  video.addEventListener("canplay", onReady);

  return () => {
    video.removeEventListener("loadeddata", onReady);
    video.removeEventListener("canplay", onReady);
    observer?.unobserve(video);
    registry.delete(video);
  };
};
