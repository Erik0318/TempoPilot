/**
 * Page hotkeys handler for TempoPilot.
 *
 * Listens for keyboard events and dispatches to VideoController actions
 * based on the user's configured shortcuts.
 *
 * Ignores keystrokes when the user is typing in form fields to avoid
 * interfering with text input.
 */
const PageHotkeys = (() => {
  let handler = null;

  function init() {
    handler = (e) => {
      // Don't intercept when user is typing
      if (isTyping(e)) return;

      const settings = VideoController.getSettings();
      if (!settings) return;
      const sc = settings.shortcuts;

      if (Keymap.matches(e, sc.increaseSpeed)) {
        e.preventDefault();
        e.stopPropagation();
        VideoController.increaseSpeed();
      } else if (Keymap.matches(e, sc.decreaseSpeed)) {
        e.preventDefault();
        e.stopPropagation();
        VideoController.decreaseSpeed();
      } else if (Keymap.matches(e, sc.resetSpeed)) {
        e.preventDefault();
        e.stopPropagation();
        VideoController.resetSpeed();
      } else if (Keymap.matches(e, sc.toggleOverlay)) {
        e.preventDefault();
        e.stopPropagation();
        VideoController.toggleOverlay();
      } else if (Keymap.matches(e, sc.cyclePreset)) {
        e.preventDefault();
        e.stopPropagation();
        VideoController.cyclePreset();
      }
    };

    document.addEventListener("keydown", handler, true);
  }

  function destroy() {
    if (handler) {
      document.removeEventListener("keydown", handler, true);
      handler = null;
    }
  }

  function isTyping(e) {
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (e.target.isContentEditable) return true;
    return false;
  }

  return { init, destroy };
})();

if (typeof globalThis.PageHotkeys === "undefined") {
  globalThis.PageHotkeys = PageHotkeys;
}

// --- Bootstrap ---
(async () => {
  await VideoController.init();
  PageHotkeys.init();
})();
