import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

export function RouteMotion({
  home,
  detail,
  fallback,
  children,
}: {
  home: ReactNode;
  detail: ReactNode;
  fallback: ReactNode;
  children: ReactNode;
}) {
  const location = useLocation();
  const [displayed, setDisplayed] = useState(location);
  const [phase, setPhase] = useState("enter");
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.pathname === displayed.pathname) {
      setPhase("enter");
      setDisplayed(location);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayed(location);
      return;
    }
    setPhase("exit");
    const timer = window.setTimeout(() => {
      setDisplayed(location);
      setPhase("enter");
    }, 180);
    return () => window.clearTimeout(timer);
  }, [location, displayed.pathname]);

  useLayoutEffect(() => {
    if (displayed.hash) {
      const target = document.getElementById(
        decodeURIComponent(displayed.hash.slice(1)),
      );
      target?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [displayed.pathname, displayed.hash]);

  useLayoutEffect(() => {
    const root = stage.current;
    if (!root) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup = () => {};
    const setup = () => {
      cleanup();
      if (media.matches) return;
      const selector =
        ".section-heading, .tour-card, .step, .story-main, .story-content, .faq > div, .detail-body > section, .detail-title, .detail-facts";
      const observed = new Set<HTMLElement>();
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
      );
      const discover = () => {
        root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
          if (observed.has(element)) return;
          observed.add(element);
          element.classList.add("scroll-reveal");
          if (element.classList.contains("tour-card")) {
            const index = Array.from(element.parentElement!.children).indexOf(
              element,
            );
            element.style.setProperty(
              "--reveal-delay",
              `${(index % 3) * 65}ms`,
            );
          }
          observer.observe(element);
        });
      };
      discover();
      const mutations = new MutationObserver(discover);
      mutations.observe(root, { childList: true, subtree: true });
      let frame = 0;
      const update = () => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        document.documentElement.style.setProperty(
          "--scroll-progress",
          `${max > 0 ? window.scrollY / max : 0}`,
        );
        root
          .querySelectorAll<HTMLElement>(".story-main, .detail-cover")
          .forEach((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < innerHeight) {
              const shift = Math.max(
                -18,
                Math.min(
                  18,
                  (innerHeight / 2 - rect.top - rect.height / 2) * 0.045,
                ),
              );
              element.style.setProperty("--photo-shift", `${shift}px`);
            }
          });
      };
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(update);
      };
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      update();
      cleanup = () => {
        observer.disconnect();
        mutations.disconnect();
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        observed.forEach((element) =>
          element.classList.remove("scroll-reveal", "is-revealed"),
        );
        root
          .querySelectorAll<HTMLElement>(".story-main, .detail-cover")
          .forEach((element) => element.style.removeProperty("--photo-shift"));
      };
    };
    setup();
    media.addEventListener("change", setup);
    return () => {
      cleanup();
      media.removeEventListener("change", setup);
    };
  }, [displayed.pathname]);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <div
        ref={stage}
        className={`route-stage route-${phase}`}
        data-route={displayed.pathname}
      >
        {children}
        <Routes location={displayed}>
          <Route path="/" element={home} />
          <Route path="/tours/:id" element={detail} />
          <Route path="*" element={fallback} />
        </Routes>
      </div>
    </>
  );
}
