import { useEffect, useRef } from "react";

const CursorGlow = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    let targetX = -1000;
    let targetY = -1000;
    let x = -1000;
    let y = -1000;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const loop = () => {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      el.style.transform = `translate3d(${x - 260}px, ${y - 260}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[40] pointer-events-none overflow-hidden mix-blend-screen"
    >
      <div
        ref={glowRef}
        className="w-[520px] h-[520px] rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(137, 170, 204, 0.07) 0%, rgba(78, 133, 191, 0.035) 40%, transparent 70%)",
        }}
      />
    </div>
  );
};

export default CursorGlow;
