document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const projectCards = document.querySelectorAll(".project-grid .project-card");

  // Phone layout is evaluated once at load; it picks which motion set runs.
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const hoverNone = window.matchMedia("(hover: none)").matches;
  const canObserve = "IntersectionObserver" in window;
  const perItem = isMobile && !prefersReducedMotion && canObserve;

  // --- Scroll Reveal Animation ---
  const revealElements = [...document.querySelectorAll(".reveal, .stagger")];

  document.querySelectorAll(".stagger").forEach((group) => {
    [...group.children].forEach((item, index) => item.style.setProperty("--i", index));
  });

  if (prefersReducedMotion || !canObserve) {
    // No observer needed: show everything up front.
    revealElements.forEach((el) => el.classList.add("active"));
  } else {
    // One-way: stop tracking once an element has fired.
    const makeRevealObserver = (className, rootMargin) =>
      new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(className);
              observer.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin, threshold: 0 }
      );

    const revealObserver = makeRevealObserver(
      "active",
      isMobile ? "0px 0px -10% 0px" : "0px 0px -50px 0px"
    );
    const itemObserver = makeRevealObserver("is-in", "0px 0px -12% 0px");

    revealElements.forEach((el) => {
      // On a phone every grid is one long column, so a group-wide entrance fires
      // while most items are still off screen. Reveal each item as it arrives.
      if (perItem && el.classList.contains("stagger")) {
        el.classList.add("stagger-each");
        [...el.children].forEach((item) => itemObserver.observe(item));
        if (!el.classList.contains("reveal")) return;
      }
      revealObserver.observe(el);
    });
  }

  // --- Current section in the navigation ---
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const navEl = document.querySelector(".nav-links");

  // On phones the highlight is one pill that slides between the links.
  const movePill = () => {
    if (!isMobile || !navEl) return;
    const current = navLinks.filter((a) => a.classList.contains("is-current")).pop();
    navEl.classList.toggle("has-pill", Boolean(current));
    if (!current) return;
    navEl.style.setProperty("--pill-x", `${current.offsetLeft}px`);
    navEl.style.setProperty("--pill-w", `${current.offsetWidth}px`);
    if (!navEl.classList.contains("pill-ready")) {
      // Wait a frame so the first placement does not animate in from the left.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => navEl.classList.add("pill-ready"))
      );
    }
  };
  window.addEventListener("resize", movePill);

  if (navLinks.length && canObserve) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = navLinks.find((a) => a.hash === `#${entry.target.id}`);
          link?.classList.toggle("is-current", entry.isIntersecting);
        });
        movePill();
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    navLinks.forEach((link) => {
      const section = document.querySelector(link.hash);
      if (section) sectionObserver.observe(section);
    });
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

  // --- Systems map pointer response ---
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

  // --- Park the systems map's animations once it scrolls away ---
  if (heroSystem && "IntersectionObserver" in window) {
    const idleObserver = new IntersectionObserver(
      ([entry]) => heroSystem.classList.toggle("is-idle", !entry.isIntersecting),
      { rootMargin: "120px" }
    );
    idleObserver.observe(heroSystem);
  }

  // --- Phone motion ---

  // Header tucks away while scrolling down and returns on the first scroll up.
  if (isMobile && !prefersReducedMotion) {
    const header = document.querySelector(".site-header");
    const setHidden = (hidden) => document.body.classList.toggle("header-hidden", hidden);
    let lastY = window.scrollY;
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const delta = y - lastY;
          if (y < 80) {
            setHidden(false);
            lastY = y;
          } else if (Math.abs(delta) > 8) {
            setHidden(delta > 0);
            lastY = y;
          }
          ticking = false;
        });
      },
      { passive: true }
    );

    header?.addEventListener("focusin", () => setHidden(false));
  }

  // On touch screens there is no hover, so the card nearest the middle of the
  // screen takes the hover look instead.
  if (isMobile && hoverNone && !prefersReducedMotion && canObserve) {
    const spotlight = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) =>
          entry.target.classList.toggle("is-spotlight", entry.isIntersecting)
        ),
      { rootMargin: "-42% 0px -42% 0px" }
    );

    document
      .querySelectorAll(
        ".project-card, .client-card, .services-grid article, .stack-grid article, .experience-card, .summary-band .glass-panel"
      )
      .forEach((card) => spotlight.observe(card));
  }

  // Projects run for several screens, so a small sticky label says which group
  // and which card you are on once the group heading has scrolled away.
  if (isMobile && canObserve) {
    document.querySelectorAll(".project-group").forEach((group) => {
      const headingBox = group.querySelector(".project-group-heading");
      const title = group.querySelector(".project-group-heading h3");
      const grid = group.querySelector(".project-grid");
      const cards = [...group.querySelectorAll(".project-card")];
      if (!headingBox || !title || !grid || cards.length < 2) return;

      const pill = document.createElement("div");
      const body = document.createElement("span");
      const name = document.createElement("span");
      const count = document.createElement("b");
      pill.className = "group-pill";
      pill.setAttribute("aria-hidden", "true");
      body.className = "group-pill-body";
      name.textContent = title.textContent;
      count.textContent = `1 / ${cards.length}`;
      body.append(name, count);
      pill.append(body);
      grid.before(pill);

      let headingGone = false;
      let groupInView = false;
      const sync = () => pill.classList.toggle("is-visible", headingGone && groupInView);

      new IntersectionObserver(([entry]) => {
        headingGone = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        sync();
      }).observe(headingBox);

      new IntersectionObserver(([entry]) => {
        groupInView = entry.isIntersecting;
        sync();
      }).observe(group);

      const position = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              count.textContent = `${cards.indexOf(entry.target) + 1} / ${cards.length}`;
            }
          }),
        { rootMargin: "-45% 0px -45% 0px" }
      );
      cards.forEach((card) => position.observe(card));
    });
  }

  // The one real number in the highlights counts up when it arrives.
  const metric = document.querySelector(".summary-band .metric");
  const metricParts = metric && /^(\d+)(.*)$/.exec(metric.textContent.trim());

  if (metricParts && !prefersReducedMotion && canObserve) {
    const target = Number(metricParts[1]);
    const rest = metricParts[2];

    // The real number stays in the page until the metric is about to scroll in,
    // so crawlers and screen readers never meet a 0.
    new IntersectionObserver(
      ([entry], observer) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        metric.textContent = `0${rest}`;
      },
      { rootMargin: "0px 0px 40% 0px" }
    ).observe(metric);

    new IntersectionObserver(
      ([entry], observer) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min(1, (now - start) / 800);
          const eased = 1 - Math.pow(1 - progress, 3);
          metric.textContent = `${Math.round(target * eased)}${rest}`;
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.8 }
    ).observe(metric);
  }

});
