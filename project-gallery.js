(() => {
  document.querySelectorAll(".media-gallery .shot > img").forEach((preview) => {
    const opener = document.createElement("button");
    const hint = document.createElement("span");

    opener.className = "shot-open";
    opener.type = "button";
    opener.dataset.lightboxSrc = preview.getAttribute("src");
    opener.dataset.lightboxAlt = preview.alt || "Expanded project screenshot";
    opener.setAttribute("aria-label", `Open ${preview.alt || "project screenshot"} at full resolution`);

    hint.className = "shot-zoom-hint";
    hint.setAttribute("aria-hidden", "true");
    hint.textContent = "Open & zoom";

    preview.parentNode.insertBefore(opener, preview);
    opener.append(preview, hint);
  });

  const openers = document.querySelectorAll("[data-lightbox-src]");
  if (!openers.length) return;

  let dialog = document.querySelector("#image-lightbox");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.className = "image-lightbox";
    dialog.id = "image-lightbox";
    dialog.setAttribute("aria-labelledby", "image-lightbox-title");
    dialog.innerHTML = `
      <div class="lightbox-shell">
        <div class="lightbox-toolbar">
          <strong id="image-lightbox-title">Screenshot viewer</strong>
          <div class="lightbox-controls" aria-label="Image zoom controls">
            <button type="button" data-lightbox-action="out" aria-label="Zoom out">−</button>
            <output id="lightbox-zoom" aria-live="polite">100%</output>
            <button type="button" data-lightbox-action="in" aria-label="Zoom in">+</button>
            <button type="button" data-lightbox-action="reset">Reset</button>
            <button class="lightbox-close" type="button" data-lightbox-action="close" aria-label="Close image viewer">×</button>
          </div>
        </div>
        <div class="lightbox-viewport" id="lightbox-viewport">
          <div class="lightbox-stage" id="lightbox-stage">
            <img id="lightbox-image" alt="" />
          </div>
        </div>
        <p class="lightbox-help">Use the controls or Ctrl/⌘ + scroll to zoom. Double-click the image to toggle zoom.</p>
      </div>`;
    document.body.append(dialog);
  }

  const image = document.querySelector("#lightbox-image");
  const viewport = document.querySelector("#lightbox-viewport");
  const stage = document.querySelector("#lightbox-stage");
  const zoomOutput = document.querySelector("#lightbox-zoom");

  if (!image || !viewport || !stage || !zoomOutput) {
    return;
  }

  const minZoom = 1;
  const maxZoom = 4;
  const zoomStep = 0.25;
  let zoom = minZoom;
  let baseWidth = 0;
  let baseHeight = 0;
  let lastOpener = null;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function fitImage() {
    if (!image.naturalWidth || !image.naturalHeight) return;

    const horizontalRoom = Math.max(280, viewport.clientWidth - 48);
    const verticalRoom = Math.max(280, viewport.clientHeight - 48);
    const fitScale = Math.min(
      1,
      horizontalRoom / image.naturalWidth,
      verticalRoom / image.naturalHeight
    );

    baseWidth = Math.round(image.naturalWidth * fitScale);
    baseHeight = Math.round(image.naturalHeight * fitScale);
    setZoom(minZoom);
  }

  function setZoom(nextZoom) {
    zoom = clamp(nextZoom, minZoom, maxZoom);
    const renderedWidth = Math.round(baseWidth * zoom);
    const renderedHeight = Math.round(baseHeight * zoom);

    image.style.width = `${renderedWidth}px`;
    image.style.height = `${renderedHeight}px`;
    stage.style.width = `${Math.max(renderedWidth, viewport.clientWidth)}px`;
    stage.style.height = `${Math.max(renderedHeight, viewport.clientHeight)}px`;
    zoomOutput.value = `${Math.round(zoom * 100)}%`;
  }

  function openImage(opener) {
    lastOpener = opener;
    image.src = opener.dataset.lightboxSrc;
    image.alt = opener.dataset.lightboxAlt || "Expanded project screenshot";
    dialog.showModal();
    document.body.classList.add("lightbox-open");
    if (image.complete) fitImage();
  }

  function closeImage() {
    dialog.close();
  }

  openers.forEach((opener) => {
    opener.addEventListener("click", () => openImage(opener));
  });

  image.addEventListener("load", fitImage);
  image.addEventListener("dblclick", () => setZoom(zoom === minZoom ? 2 : minZoom));

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeImage();
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
    image.removeAttribute("src");
    if (lastOpener) lastOpener.focus();
  });

  dialog.addEventListener("cancel", () => {
    document.body.classList.remove("lightbox-open");
  });

  dialog.querySelectorAll("[data-lightbox-action]").forEach((control) => {
    control.addEventListener("click", () => {
      const action = control.dataset.lightboxAction;
      if (action === "in") setZoom(zoom + zoomStep);
      if (action === "out") setZoom(zoom - zoomStep);
      if (action === "reset") setZoom(minZoom);
      if (action === "close") closeImage();
    });
  });

  viewport.addEventListener(
    "wheel",
    (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setZoom(zoom + (event.deltaY < 0 ? zoomStep : -zoomStep));
    },
    { passive: false }
  );

  window.addEventListener("resize", () => {
    if (dialog.open) fitImage();
  });
})();
