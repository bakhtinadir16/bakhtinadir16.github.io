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

    const unregister = registerAutoplayVideo(video);
    // hls attaches the source late, so start it once the stream is ready.
    // requestPlay, not play, so an off-screen footer stays paused.
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
    // no autoplay attr, it would ignore the on-screen check
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
