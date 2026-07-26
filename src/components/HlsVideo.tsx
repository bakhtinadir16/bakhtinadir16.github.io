import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { registerAutoplayVideo, requestPlay } from "../lib/video";

interface HlsVideoProps {
  src: string;
  className?: string;
}

const HlsVideo = ({ src, className }: HlsVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Gesture-aware + visibility-gated autoplay (see lib/video).
    const unregister = registerAutoplayVideo(video);
    // The source attaches asynchronously, so the `autoplay` attribute alone
    // never fires — kick playback off once the stream is actually ready.
    // requestPlay (not play) so an off-screen footer stays paused.
    const start = () => requestPlay(video);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, start);
      return () => {
        hls.destroy();
        unregister();
      };
    }

    // Native HLS (iOS Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", start);
      return () => {
        video.removeEventListener("loadedmetadata", start);
        unregister();
      };
    }

    return unregister;
  }, [src]);

  return (
    // No `autoplay` attribute on purpose: the browser would start this as soon
    // as data arrives, ignoring the on-screen gate. lib/video drives playback.
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      className={className}
    />
  );
};

export default HlsVideo;
