import { useEffect, useRef } from "react";

// Actual document measurements keep the scene aligned when content expands.
export const usePageScroll = () => {
  const scrollRef = useRef({ progress: 0, chapter: 0, hero: 0, departure: 0 });

  useEffect(() => {
    const root = document.documentElement;
    const story = document.querySelector(".story");
    const sections = [...document.querySelectorAll(".chapter")];
    let positions = [];
    let maxScroll = 1;
    let world = { center: window.innerHeight / 2, width: 400 };
    let frame = 0;
    let lastActive = "";

    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const progress = Math.min(1, y / maxScroll);
      const readingLine = y + Math.min(window.innerHeight * 0.3, 180);
      let index = 0;
      for (let i = 1; i < positions.length; i++) {
        if (readingLine >= positions[i]) index = i;
      }
      if (y >= maxScroll - 2) index = sections.length - 1;

      let chapterIndex = 0;
      for (let i = 1; i < positions.length; i++) {
        if (y >= positions[i]) chapterIndex = i;
      }
      const start = positions[chapterIndex] || 0;
      const end = positions[chapterIndex + 1] ?? maxScroll;
      const fraction = Math.max(
        0,
        Math.min(1, (y - start) / Math.max(1, end - start)),
      );
      // On phones the globe follows the text. Let it reach the viewport
      // before transitioning into the background of the next section.
      const departureStart = Math.max(
        100,
        world.center - window.innerHeight * 0.15,
      );
      const departureEnd = world.center + world.width * 0.3;
      const departure = Math.max(
        0,
        Math.min(
          1,
          (y - departureStart) / Math.max(1, departureEnd - departureStart),
        ),
      );
      scrollRef.current = {
        progress,
        chapter: Math.min(sections.length - 1, chapterIndex + fraction),
        hero: Math.min(1, y / Math.max(1, positions[1] || window.innerHeight)),
        departure: departure * departure * (3 - 2 * departure),
      };
      root.style.setProperty("--page-progress", progress);
      root.style.setProperty("--hero-progress", scrollRef.current.hero);
      root.style.setProperty("--scene-departure", scrollRef.current.departure);
      root.dataset.scrolled = y > 40 ? "true" : "false";
      const activeId = sections[index]?.id || "about";
      if (activeId !== lastActive) {
        lastActive = activeId;
        root.dataset.section = activeId;
        window.dispatchEvent(
          new CustomEvent("portfolio-section", { detail: activeId }),
        );
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const measure = () => {
      positions = sections.map(
        (section) => section.getBoundingClientRect().top + window.scrollY,
      );
      maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
      const rect = document
        .getElementById("hero-world")
        ?.getBoundingClientRect();
      if (rect)
        world = {
          center: rect.top + window.scrollY + rect.height / 2,
          width: rect.width,
        };
      schedule();
    };

    measure();
    // The browser can look for the fragment before React has mounted its target.
    // Restore an initial section link after layout, without replacing a saved scroll position.
    const hashFrame = requestAnimationFrame(() => {
      const target = sections.find(
        (section) => `#${section.id}` === window.location.hash,
      );
      if (target && window.scrollY < 1) {
        target.scrollIntoView({ behavior: "instant", block: "start" });
        measure();
      }
    });
    const observer = new ResizeObserver(measure);
    if (story) observer.observe(story);
    sections.forEach((section) => observer.observe(section));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(hashFrame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return scrollRef;
};
