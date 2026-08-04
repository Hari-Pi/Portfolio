document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const projectCards = document.querySelectorAll(
    ".project-grid .project-card:not(.archived-card)"
  );

  // --- Scroll Reveal Animation ---
  const revealElements = document.querySelectorAll(".reveal:not(.archived-card)");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    // No observer needed: show everything up front.
    revealElements.forEach((el) => el.classList.add("active"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            // Reveal is one-way, so stop tracking once it has fired.
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -50px 0px",
        threshold: 0,
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // --- Card Clickability ---
  projectCards.forEach((card) => {
    const detailsLink = card.querySelector('a.project-link[href^="projects/"]');
    if (!detailsLink) return;

    card.style.cursor = "pointer";

    card.addEventListener("click", (e) => {
      // Do not navigate if a specific link was clicked
      if (e.target.closest("a")) return;
      window.location.href = detailsLink.href;
    });
  });
});
