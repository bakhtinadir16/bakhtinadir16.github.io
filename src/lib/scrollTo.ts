const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const animateScrollTo = (targetY: number) => {
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;
  const duration = Math.min(2200, 800 + Math.abs(distance) * 0.22);
  const start = performance.now();
  const step = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    window.scrollTo({
      top: startY + distance * easeInOutCubic(progress),
      behavior: "instant" as ScrollBehavior,
    });
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

export const scrollToSection = (selector: string) => {
  const el = document.querySelector(selector);
  if (!el) return;
  animateScrollTo(el.getBoundingClientRect().top + window.scrollY);
};
