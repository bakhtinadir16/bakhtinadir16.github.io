import { useEffect, useRef } from "react";
import { useMotion } from "../lib/motion";

const STAR_COUNT = 380;
const STAR_COLORS = ["137, 170, 204", "78, 133, 191", "225, 230, 240"];

interface Star {
  x: number; // 0..1 of width
  y: number; // 0..1 of one wrap-band height
  depth: number; // 0..1, closer = faster parallax + brighter
  radius: number;
  color: string;
  twinklePhase: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

const SpaceJourney = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motionEnabled } = useMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      depth: Math.random(),
      radius: Math.random() * 1.3 + 0.4,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    const meteors: Meteor[] = [];
    let nextMeteorAt = 2 + Math.random() * 4;

    const mouseTarget = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouseTarget.x = (e.clientX / width - 0.5) * 2;
      mouseTarget.y = (e.clientY / height - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let lastScroll = window.scrollY;
    let warpVelocity = 0;
    let time = 0;
    let raf = 0;

    const draw = () => {
      time += 0.016;
      const scroll = window.scrollY;
      // Smooth the scroll velocity so warp streaks ease in and out
      warpVelocity += (scroll - lastScroll - warpVelocity) * 0.08;
      lastScroll = scroll;

      let forceMotion = false;
      if (import.meta.env.DEV) {
        const w = window as unknown as Record<string, unknown>;
        w.__warpDebug = { scroll, warpVelocity };
        if (typeof w.__forceWarp === "number") {
          warpVelocity = w.__forceWarp;
          forceMotion = true;
        }
        if (w.__forceMotion === true) forceMotion = true;
      }
      const motionOff = !motionEnabled && !forceMotion;

      mouse.x += (mouseTarget.x - mouse.x) * 0.06;
      mouse.y += (mouseTarget.y - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // Drifting nebula glows in the accent palette, nudged by the cursor
      const nx =
        width * (0.25 + 0.08 * Math.sin(time * 0.04)) - mouse.x * 30;
      const ny =
        height * (0.35 + 0.06 * Math.cos(time * 0.05)) - mouse.y * 20;
      const nebula1 = ctx.createRadialGradient(nx, ny, 0, nx, ny, width * 0.45);
      nebula1.addColorStop(0, "rgba(78, 133, 191, 0.055)");
      nebula1.addColorStop(1, "rgba(78, 133, 191, 0)");
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const mx = width * (0.78 - 0.06 * Math.sin(time * 0.03)) - mouse.x * 45;
      const my = height * (0.7 + 0.05 * Math.sin(time * 0.045)) - mouse.y * 30;
      const nebula2 = ctx.createRadialGradient(mx, my, 0, mx, my, width * 0.4);
      nebula2.addColorStop(0, "rgba(137, 170, 204, 0.04)");
      nebula2.addColorStop(1, "rgba(137, 170, 204, 0)");
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      const band = height * 1.3; // wrap band taller than viewport to avoid pop-in
      for (const star of stars) {
        const depthFactor = 0.15 + star.depth * 0.85;
        // Parallax travel: stars drift past as you scroll, faster when closer
        const rawY = star.y * band - scroll * depthFactor * 0.35;
        const parallaxY = motionOff ? 0 : mouse.y * 26 * depthFactor;
        const parallaxX = motionOff ? 0 : mouse.x * 42 * depthFactor;
        const py =
          ((rawY % band) + band) % band - (band - height) / 2 - parallaxY;
        const px =
          star.x * width +
          Math.sin(time * 0.1 + star.twinklePhase) * 6 * star.depth -
          parallaxX;

        const twinkle = motionOff
          ? 0.75
          : 0.55 +
            0.45 * Math.sin(time * (1 + star.depth * 2.5) + star.twinklePhase);
        const alpha = (0.2 + 0.6 * star.depth) * twinkle;

        const streak = motionOff
          ? 0
          : Math.max(Math.min(warpVelocity * depthFactor * 1.1, 180), -180);

        if (Math.abs(streak) > 3) {
          // Warp mode: stretch the star along the direction of travel
          const gradient = ctx.createLinearGradient(px, py, px, py + streak);
          gradient.addColorStop(0, `rgba(${star.color}, ${alpha})`);
          gradient.addColorStop(1, `rgba(${star.color}, 0)`);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = star.radius * 1.4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px, py + streak);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${star.color}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, star.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Shooting stars
      if (!motionOff && time >= nextMeteorAt) {
        const fromLeft = Math.random() > 0.5;
        const angle = (20 + Math.random() * 18) * (Math.PI / 180);
        const speed = 14 + Math.random() * 8;
        meteors.push({
          x: width * (fromLeft ? 0.05 + Math.random() * 0.3 : 0.65 + Math.random() * 0.3),
          y: height * (0.05 + Math.random() * 0.4),
          vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 50 + Math.random() * 30,
        });
        nextMeteorAt = time + 4 + Math.random() * 7;
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life++;
        if (m.life >= m.maxLife) {
          meteors.splice(i, 1);
          continue;
        }
        const fade = Math.sin((m.life / m.maxLife) * Math.PI);
        const tailX = m.x - m.vx * 9;
        const tailY = m.y - m.vy * 9;
        const tail = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        tail.addColorStop(0, `rgba(235, 240, 250, ${0.9 * fade})`);
        tail.addColorStop(0.3, `rgba(137, 170, 204, ${0.45 * fade})`);
        tail.addColorStop(1, "rgba(137, 170, 204, 0)");
        ctx.strokeStyle = tail;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${fade})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [motionEnabled]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
};

export default SpaceJourney;
