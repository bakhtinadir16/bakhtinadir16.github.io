// Autoplay helper for the hero + footer background videos.
// Mobile blocks autoplay until a tap, and iOS only decodes a couple of videos
// at once, so we play whichever one is on screen and pause the rest.

interface Entry {
  visible: boolean;
}

const registry = new Map<HTMLVideoElement, Entry>();
let observer: IntersectionObserver | null = null;
let gesturesBound = false;

// --- setup ---

const prepare = (video: HTMLVideoElement) => {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  // iOS checks the attributes, not just the properties React sets
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
};

// --- playback ---

const tryPlay = (video: HTMLVideoElement) => {
  if (!registry.get(video)?.visible) return;
  if (!video.paused) return;
  const p = video.play();
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

// --- api ---

// Play only if the video is on screen
export const requestPlay = (video: HTMLVideoElement) => tryPlay(video);

export const registerAutoplayVideo = (video: HTMLVideoElement) => {
  ensureGlobals();
  prepare(video);
  registry.set(video, { visible: false });
  observer!.observe(video);

  // hls attaches the source after mount, so wait for data
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
