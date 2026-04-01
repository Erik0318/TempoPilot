/**
 * Video finder for TempoPilot.
 *
 * Discovers HTML5 <video> elements on the page, including those added
 * dynamically (SPAs, lazy-loaded players). Uses a MutationObserver to
 * watch for new videos.
 *
 * VIDEO TARGETING STRATEGY:
 * When multiple videos exist, the "active" video is chosen by priority:
 *   1. The video the mouse is currently hovering over.
 *   2. The most recently interacted video (click/play/pause).
 *   3. The largest visible video that is currently playing.
 *   4. The largest visible video overall.
 *   5. The first video on the page as a last resort.
 *
 * Future extension points:
 * - Per-site selector overrides for non-standard players
 * - Blacklist/whitelist domains
 * - Shadow DOM traversal for deeper player discovery
 */
const VideoFinder = (() => {
  const tracked = new Set();
  const callbacks = { added: [], removed: [] };

  let hoveredVideo = null;
  let lastInteractedVideo = null;
  let observer = null;

  function onAdded(fn) { callbacks.added.push(fn); }
  function onRemoved(fn) { callbacks.removed.push(fn); }

  function track(video) {
    if (tracked.has(video)) return;
    tracked.add(video);

    video.addEventListener("mouseenter", () => { hoveredVideo = video; });
    video.addEventListener("mouseleave", () => { if (hoveredVideo === video) hoveredVideo = null; });
    video.addEventListener("play", () => { lastInteractedVideo = video; });
    video.addEventListener("click", () => { lastInteractedVideo = video; });

    callbacks.added.forEach((fn) => fn(video));
  }

  function untrack(video) {
    if (!tracked.has(video)) return;
    tracked.delete(video);
    if (hoveredVideo === video) hoveredVideo = null;
    if (lastInteractedVideo === video) lastInteractedVideo = null;
    callbacks.removed.forEach((fn) => fn(video));
  }

  function scanNode(root) {
    if (root.nodeName === "VIDEO") {
      track(root);
    }
    if (root.querySelectorAll) {
      root.querySelectorAll("video").forEach(track);
    }
  }

  function init() {
    // Initial scan
    scanNode(document);

    // Watch for dynamically added/removed videos
    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) scanNode(node);
        }
        for (const node of m.removedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.nodeName === "VIDEO") untrack(node);
            if (node.querySelectorAll) {
              node.querySelectorAll("video").forEach(untrack);
            }
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    tracked.clear();
    hoveredVideo = null;
    lastInteractedVideo = null;
  }

  /**
   * Return the video that should currently receive speed commands.
   */
  function getActiveVideo() {
    // 1. Hovered video
    if (hoveredVideo && document.contains(hoveredVideo)) return hoveredVideo;

    // 2. Last interacted
    if (lastInteractedVideo && document.contains(lastInteractedVideo)) return lastInteractedVideo;

    // Build a list of candidates from tracked set
    const videos = [...tracked].filter((v) => document.contains(v));
    if (videos.length === 0) return null;

    // 3. Largest visible playing video
    const playing = videos.filter((v) => !v.paused);
    const visiblePlaying = playing.filter(isVisible);
    if (visiblePlaying.length > 0) return largestByArea(visiblePlaying);

    // 4. Largest visible video
    const visible = videos.filter(isVisible);
    if (visible.length > 0) return largestByArea(visible);

    // 5. First video
    return videos[0];
  }

  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function largestByArea(list) {
    let best = list[0];
    let bestArea = 0;
    for (const v of list) {
      const r = v.getBoundingClientRect();
      const area = r.width * r.height;
      if (area > bestArea) { best = v; bestArea = area; }
    }
    return best;
  }

  function getAll() {
    return [...tracked];
  }

  return { init, destroy, getActiveVideo, getAll, onAdded, onRemoved };
})();

if (typeof globalThis.VideoFinder === "undefined") {
  globalThis.VideoFinder = VideoFinder;
}
