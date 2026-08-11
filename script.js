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

  // --- Randomised gradient backdrop -------------------------------------
  // Builds a fresh colour journey on every visit and hands it to the existing
  // scroll timeline, so the backdrop is a different "wallpaper" each load while
  // still evolving as you scroll. The CSS keyframes remain the fallback for
  // no-JS, reduced-motion, and browsers without scroll-driven animations.
  const backdrop = document.querySelector(".bg-blobs");
  const canScrollDrive =
    window.CSS &&
    CSS.supports &&
    CSS.supports("animation-timeline: scroll()") &&
    CSS.supports("background", "radial-gradient(circle at 50% 50%, red, transparent 50%)");

  if (backdrop && canScrollDrive && !prefersReducedMotion) {
    const rand = (min, max) => min + Math.random() * (max - min);

    // Sampling continuous random values from one narrow warm band just averages
    // out to the same brown at every stop — random, but not *noticeable*.
    // Instead: a set of deliberately distinct warm moods, shuffled per visit and
    // jittered so no two loads are identical. Adjacent stops then always contrast,
    // because they are different moods rather than neighbouring random numbers.
    // High saturation with restrained lightness: that combination stays dark
    // enough not to wash out the translucent cards, while still reading as a
    // real colour rather than brown. Lightness is the thing that washes panels
    // out, not alpha, so alpha is where the intensity comes from.
    const MOODS = [
      { name: "gold",    hue: [40, 48], sat: [86, 96], light: [40, 48], alpha: [0.3, 0.38] },
      { name: "ember",   hue: [24, 33], sat: [86, 96], light: [36, 44], alpha: [0.32, 0.4] },
      { name: "crimson", hue: [4, 14],  sat: [82, 94], light: [28, 36], alpha: [0.34, 0.42] },
      { name: "rust",    hue: [16, 24], sat: [80, 92], light: [32, 40], alpha: [0.32, 0.4] },
      { name: "apricot", hue: [30, 40], sat: [88, 98], light: [44, 52], alpha: [0.28, 0.36] },
    ];
    const COOL = [
      [184, 196], // teal
      [204, 218], // blue
    ];

    const hsl = (h, s, l, a) =>
      `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}% / ${a.toFixed(3)})`;
    const fromMood = (m, alphaScale = 1, lightShift = 0) =>
      hsl(
        rand(m.hue[0], m.hue[1]),
        rand(m.sat[0], m.sat[1]),
        Math.max(12, rand(m.light[0], m.light[1]) + lightShift),
        rand(m.alpha[0], m.alpha[1]) * alphaScale
      );
    const coolStop = (a) => {
      const band = COOL[Math.floor(Math.random() * COOL.length)];
      return hsl(rand(band[0], band[1]), rand(52, 74), rand(36, 50), a);
    };

    // Fisher-Yates, then take 5 stops so each mood holds long enough to register.
    const order = MOODS.slice();
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const sequence = order.slice(0, 5);

    // Alternate quiet and vivid stops. Equal-intensity stops read as one flat
    // wash however much the hue moves, so the contrast between neighbours is
    // what actually registers while scrolling.
    const vividStart = Math.random() < 0.5;

    const frames = sequence.map((mood, i) => {
      const pct = Math.round((i / (sequence.length - 1)) * 100);
      const vivid = i % 2 === (vividStart ? 0 : 1);
      // A wide gap between the two states is the point — a vivid stop next to a
      // near-dark one is what you actually perceive as the background changing.
      const intensity = vivid ? rand(1.2, 1.5) : rand(0.34, 0.5);
      // Alternate which stops carry a true cool accent so it reappears through
      // the scroll without ever leading.
      const coolTurn = i % 2 === 1;

      // Colour and intensity only — positions are randomised per visit but held
      // still while scrolling. Measured on a 4x-throttled mobile profile:
      // nothing animating 54fps, colour only 43fps, colour + a position sweep
      // 29fps. The sweep cost 14fps and added little the intensity pulse was not
      // already doing, so it is not worth it.
      return (
        `${pct}%{` +
        `--tint-warm:${fromMood(mood, intensity)};` +
        `--tint-cool:${coolTurn ? coolStop(rand(0.13, 0.2) * (vivid ? 1.25 : 0.8)) : fromMood(mood, 0.45 * intensity, 4)};` +
        `--tint-deep:${fromMood(mood, 0.95 * intensity, -24)};` +
        `}`
      );
    });

    const name = `bg-tint-random-${Math.floor(Math.random() * 1e6)}`;
    const sheet = document.createElement("style");
    sheet.textContent = `@keyframes ${name}{${frames.join("")}}`;
    document.head.appendChild(sheet);

    // Static per visit: every layer's placement and spread. Randomising these
    // still makes each load a different composition, with no per-frame cost.
    backdrop.style.setProperty("--warm-x", `${rand(56, 92).toFixed(0)}%`);
    backdrop.style.setProperty("--warm-y", `${rand(4, 30).toFixed(0)}%`);
    backdrop.style.setProperty("--cool-x", `${rand(4, 40).toFixed(0)}%`);
    backdrop.style.setProperty("--cool-y", `${rand(58, 94).toFixed(0)}%`);
    backdrop.style.setProperty("--deep-x", `${rand(26, 74).toFixed(0)}%`);
    backdrop.style.setProperty("--deep-y", `${rand(24, 70).toFixed(0)}%`);
    backdrop.style.setProperty("--spread-warm", `${rand(50, 68).toFixed(0)}%`);
    backdrop.style.setProperty("--spread-cool", `${rand(52, 70).toFixed(0)}%`);
    backdrop.style.setProperty("--spread-deep", `${rand(64, 80).toFixed(0)}%`);

    // Swap the CSS journey for the generated one, keeping the parallax layer.
    backdrop.style.animationName = `parallax-bg, ${name}`;
    backdrop.style.animationTimingFunction = "linear, linear";
    backdrop.style.animationFillMode = "both, both";
    backdrop.style.animationTimeline = "scroll(root block), scroll(root block)";
  }
});
