/**
 * Overlay UI for TempoPilot.
 *
 * Renders a small speed badge at the top-left of each tracked video element.
 * Uses a container positioned over the video so it doesn't interfere with the
 * page layout. Walks up the DOM to find the best anchor element (the video's
 * positioned container) so the overlay isn't trapped in a low stacking context.
 *
 * Future extension points:
 * - Multiple overlay themes / positions
 * - Per-video overlay customization
 * - Richer overlay content (controls, mini-menu)
 */
const Overlay = (() => {
  const overlays = new WeakMap(); // video -> overlay entry
  let globalVisible = true;
  let autoHideMs = 0;

  const OVERLAY_CLASS = "tempopilot-overlay";
  const CONTAINER_CLASS = "tempopilot-overlay-wrap";

  function injectStyles() {
    if (document.getElementById("tempopilot-styles")) return;
    const style = document.createElement("style");
    style.id = "tempopilot-styles";
    style.textContent = `
      .${CONTAINER_CLASS} {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
        z-index: 2147483647 !important;
        overflow: visible !important;
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      .${OVERLAY_CLASS} {
        position: absolute !important;
        top: 8px !important;
        left: 8px !important;
        background: rgba(0, 0, 0, 0.75) !important;
        color: #fff !important;
        font: bold 13px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        padding: 4px 8px !important;
        border-radius: 4px !important;
        pointer-events: none !important;
        user-select: none !important;
        transition: opacity 0.2s ease !important;
        opacity: 1 !important;
        white-space: nowrap !important;
        visibility: visible !important;
        display: block !important;
        z-index: 2147483647 !important;
      }
      .${OVERLAY_CLASS}.tp-hidden {
        opacity: 0 !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  /**
   * Find the best anchor element to host the overlay. Walk up from the video
   * to find a positioned container that's roughly the same size as the video
   * (the "player" wrapper). This avoids being trapped in a low stacking context
   * on sites like YouTube where the direct parent has lower z-index siblings.
   */
  function findAnchor(video) {
    const vRect = video.getBoundingClientRect();
    if (vRect.width === 0 || vRect.height === 0) return video.parentElement;

    let best = video.parentElement;
    let el = video.parentElement;
    const maxLevels = 5;
    for (let i = 0; i < maxLevels && el && el !== document.body; i++) {
      const style = getComputedStyle(el);
      const pos = style.position;
      if (pos === "relative" || pos === "absolute" || pos === "fixed") {
        const elRect = el.getBoundingClientRect();
        // Accept if it's roughly the same size or bigger than the video
        if (elRect.width >= vRect.width * 0.9 && elRect.height >= vRect.height * 0.9) {
          best = el;
        }
      }
      el = el.parentElement;
    }
    return best;
  }

  function ensureWrapper(video) {
    let entry = overlays.get(video);
    if (entry) {
      // Re-inject if the container was removed from the DOM (YouTube DOM churn)
      if (!document.contains(entry.container)) {
        const anchor = findAnchor(video);
        if (anchor) anchor.appendChild(entry.container);
      }
      return entry.badge;
    }

    const anchor = findAnchor(video);
    if (!anchor) return null;

    const anchorPos = getComputedStyle(anchor).position;
    if (anchorPos === "static") {
      anchor.style.position = "relative";
    }

    const container = document.createElement("div");
    container.className = CONTAINER_CLASS;

    const badge = document.createElement("div");
    badge.className = OVERLAY_CLASS;
    badge.textContent = "1.0\u00d7";
    if (!globalVisible) badge.classList.add("tp-hidden");

    container.appendChild(badge);
    anchor.appendChild(container);

    overlays.set(video, { container, badge, hideTimer: null });
    return badge;
  }

  function update(video, speed) {
    injectStyles();
    const badge = ensureWrapper(video);
    if (!badge) return;

    const text = formatSpeed(speed);
    badge.textContent = text;

    // Auto-hide logic
    if (globalVisible && autoHideMs > 0) {
      badge.classList.remove("tp-hidden");
      const entry = overlays.get(video);
      clearTimeout(entry.hideTimer);
      entry.hideTimer = setTimeout(() => {
        badge.classList.add("tp-hidden");
      }, autoHideMs);
    }
  }

  function setVisible(visible) {
    globalVisible = visible;
  }

  function applyVisibility(video) {
    const entry = overlays.get(video);
    if (!entry) return;
    if (globalVisible) {
      entry.badge.classList.remove("tp-hidden");
    } else {
      entry.badge.classList.add("tp-hidden");
    }
  }

  function remove(video) {
    const entry = overlays.get(video);
    if (!entry) return;
    clearTimeout(entry.hideTimer);
    entry.container.remove();
    overlays.delete(video);
  }

  function configure(settings) {
    globalVisible = settings.showOverlay;
    autoHideMs = settings.overlayAutoHideMs || 0;
  }

  function isVisible() {
    return globalVisible;
  }

  function formatSpeed(speed) {
    // Show up to 2 decimal places, strip trailing zeros
    return speed % 1 === 0 ? speed.toFixed(1) + "×" : parseFloat(speed.toFixed(2)) + "×";
  }

  return { update, remove, setVisible, applyVisibility, configure, isVisible, injectStyles };
})();

if (typeof globalThis.Overlay === "undefined") {
  globalThis.Overlay = Overlay;
}
