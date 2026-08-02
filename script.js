document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // --- Filtering Logic ---
  const filterButtons = document.querySelectorAll(".filter-button");
  const projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      // Update button states
      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      // Filter cards. Toggling .hidden off and .active on in the same frame
      // would skip the transition, so unhide first and let the next frame
      // start the reveal.
      projectCards.forEach((card) => {
        const matchesFilter =
          filter === "all" || card.dataset.category === filter;

        if (matchesFilter) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
          card.classList.remove("active");
        }
      });

      requestAnimationFrame(() => {
        projectCards.forEach((card) => {
          if (!card.classList.contains("hidden")) {
            card.classList.add("active");
          }
        });
      });
    });
  });

  // --- Scroll Reveal Animation ---
  const revealElements = document.querySelectorAll(".reveal");

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
