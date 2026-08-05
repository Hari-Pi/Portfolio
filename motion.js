document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) return;

  const targets = document.querySelectorAll(
    ".detail-main > .project-detail-header, " +
      ".detail-main > .project-hero, " +
      ".detail-main > .case-summary, " +
      ".detail-main > .media-gallery, " +
      ".detail-main > .project-content, " +
      ".detail-main > .project-pagination, " +
      ".detail-main + .site-footer"
  );

  if (!("IntersectionObserver" in window)) return;

  targets.forEach((target, index) => {
    target.classList.add("motion-reveal");
    target.style.setProperty("--motion-delay", `${Math.min(index, 4) * 45}ms`);
  });

  const observer = new IntersectionObserver(
    (entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("motion-visible");
        activeObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -7% 0px",
      threshold: 0.04,
    }
  );

  targets.forEach((target) => observer.observe(target));
});
