document.addEventListener("DOMContentLoaded", () => {
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

      // Filter cards
      projectCards.forEach((card) => {
        const matchesFilter = filter === "all" || card.dataset.category === filter;
        
        // Remove reveal active class briefly to re-trigger animation if visible
        if (matchesFilter) {
          card.classList.remove("hidden");
          // slight delay to allow layout calculation before adding active
          setTimeout(() => {
            card.classList.add("active");
          }, 50);
        } else {
          card.classList.add("hidden");
          card.classList.remove("active");
        }
      });
    });
  });

  // --- Scroll Reveal Animation ---
  const revealElements = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add small delay based on order if multiple items appear at once (optional enhancement)
          entry.target.classList.add("active");
          // observer.unobserve(entry.target); // Uncomment to only animate once
        }
      });
    },
    {
      root: null,
      rootMargin: "0px",
      threshold: 0.15, // Trigger when 15% of the element is visible
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // --- Card Clickability ---
  projectCards.forEach((card) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      // Do not navigate if a specific link was clicked
      if (e.target.closest("a")) return;
      
      // Find the main project details link
      const detailsLink = card.querySelector('a.project-link[href^="projects/"]');
      if (detailsLink) {
        window.location.href = detailsLink.href;
      }
    });
  });
});
