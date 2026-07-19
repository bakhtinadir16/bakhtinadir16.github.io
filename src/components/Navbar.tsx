import { useEffect, useState } from "react";
import { useMotion } from "../lib/motion";
import { useSound } from "../lib/sound";
import { scrollToSection } from "../lib/scrollTo";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Work", href: "#work" },
  { label: "Resume", href: "#resume" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("Home");
  const { motionEnabled } = useMotion();
  const { playWhoosh } = useSound();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (e: React.MouseEvent, href: string, label: string) => {
    e.preventDefault();
    setActive(label);
    if (motionEnabled) {
      playWhoosh();
      scrollToSection(href);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4">
      <nav
        className={`inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface px-2 py-2 transition-shadow duration-300 ${
          scrolled ? "shadow-md shadow-black/10" : ""
        }`}
      >
        {/* Logo */}
        <a
          href="#home"
          onClick={(e) => scrollTo(e, "#home", "Home")}
          className="group relative w-9 h-9 rounded-full p-[2px] accent-gradient transition-transform duration-300 hover:scale-110 hover:[background:linear-gradient(270deg,#89AACC_0%,#4E85BF_100%)]"
        >
          <span className="flex items-center justify-center w-full h-full rounded-full bg-bg font-display italic text-[13px] text-text-primary">
            NB
          </span>
        </a>

        <span className="hidden sm:block w-px h-5 bg-stroke mx-1" />

        {/* Links */}
        <ul className="flex items-center">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                onClick={(e) => scrollTo(e, href, label)}
                className={`block text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-colors duration-200 ${
                  active === label
                    ? "text-text-primary bg-stroke/50"
                    : "text-muted hover:text-text-primary hover:bg-stroke/50"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <span className="hidden sm:block w-px h-5 bg-stroke mx-1" />

        {/* Say hi */}
        <a
          href="mailto:nadirbakhtics@gmail.com"
          className="group relative text-xs sm:text-sm rounded-full"
        >
          <span className="absolute -inset-[2px] rounded-full accent-gradient-animated opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center gap-1 bg-surface rounded-full backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 text-text-primary">
            Say hi <span aria-hidden>↗</span>
          </span>
        </a>
      </nav>
    </header>
  );
};

export default Navbar;
