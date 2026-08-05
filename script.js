document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const projectCards = document.querySelectorAll(".project-grid .project-card");

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

  // --- Hero system map pointer response ---
  const heroSystem = document.querySelector(".hero-system");
  const hasPrecisePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (heroSystem && hasPrecisePointer && !prefersReducedMotion) {
    let pointerFrame = 0;

    heroSystem.addEventListener("pointermove", (event) => {
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const bounds = heroSystem.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        heroSystem.style.setProperty("--system-rx", `${(-y * 5).toFixed(2)}deg`);
        heroSystem.style.setProperty("--system-ry", `${(x * 6).toFixed(2)}deg`);
      });
    });

    heroSystem.addEventListener("pointerleave", () => {
      heroSystem.style.setProperty("--system-rx", "0deg");
      heroSystem.style.setProperty("--system-ry", "0deg");
    });
  }

  // --- Real project preview ---
  const previewVideos = document.querySelectorAll("[data-preview-video]");
  const playPreview = (video) => video.play().catch(() => {});
  const pausePreview = (video) => video.pause();

  if (!prefersReducedMotion) {
    if (hasPrecisePointer) {
      previewVideos.forEach((video) => {
        const card = video.closest(".project-card");
        card?.addEventListener("mouseenter", () => playPreview(video));
        card?.addEventListener("mouseleave", () => pausePreview(video));
      });
    } else if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) playPreview(video);
            else pausePreview(video);
          });
        },
        { threshold: 0.65 }
      );

      previewVideos.forEach((video) => videoObserver.observe(video));
    }
  }

  // --- Park the hero system map's animations once it scrolls away ---
  if (heroSystem && "IntersectionObserver" in window) {
    const idleObserver = new IntersectionObserver(
      ([entry]) => heroSystem.classList.toggle("is-idle", !entry.isIntersecting),
      { rootMargin: "120px" }
    );
    idleObserver.observe(heroSystem);
  }
});
