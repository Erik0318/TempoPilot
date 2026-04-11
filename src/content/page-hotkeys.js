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

      let handled = false;
      if (Keymap.matches(e, sc.increaseSpeed)) {
        handled = VideoController.increaseSpeed();
      } else if (Keymap.matches(e, sc.decreaseSpeed)) {
        handled = VideoController.decreaseSpeed();
      } else if (Keymap.matches(e, sc.resetSpeed)) {
        handled = VideoController.resetSpeed();
      } else if (Keymap.matches(e, sc.toggleOverlay)) {
        handled = VideoController.toggleOverlay();
      } else if (Keymap.matches(e, sc.cyclePreset)) {
        handled = VideoController.cyclePreset();
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
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

  /**
   * Check whether a DOM element accepts text input.
   */
  function isEditable(el) {
    const tag = el.tagName;
    if (tag === "INPUT") {
      const type = (el.type || "text").toLowerCase();
      const nonText = ["button", "checkbox", "radio", "range", "color",
                       "file", "image", "reset", "submit", "hidden"];
      return !nonText.includes(type);
    }
    if (tag === "TEXTAREA" || tag === "SELECT") return true;
    if (el.isContentEditable) return true;
    const role = el.getAttribute?.("role");
    if (role === "textbox" || role === "searchbox" || role === "combobox"
        || role === "spinbutton") return true;
    // Catch inputs wrapped in custom elements (closed shadow DOM hosts
    // that expose ARIA hints on the host element)
    if (el.hasAttribute?.("aria-multiline")
        || el.hasAttribute?.("aria-placeholder")
        || el.hasAttribute?.("aria-autocomplete")) return true;
    return false;
  }

  /**
   * Determine whether the user is currently typing in any text field.
   *
   * Three detection layers:
   *  1. Walk the composed event path — this pierces open shadow DOM so we
   *     see the real <input>/<textarea>/contentEditable inside web components.
   *  2. Walk the document.activeElement chain through open shadow roots —
   *     covers cases where the event path was retargeted.
   *  3. Check document.designMode (whole-page editing, e.g. Gmail compose).
   */
  function isTyping(e) {
    // Layer 1 – composed event path (open shadow DOM)
    const path = e.composedPath?.() || [];
    for (const node of path) {
      if (node === document || node === window) break;
      if (node.nodeType === 1 && isEditable(node)) return true;
    }

    // Layer 2 – activeElement chain through shadow roots
    let active = document.activeElement;
    while (active && active !== document.body
           && active !== document.documentElement) {
      if (isEditable(active)) return true;
      const sr = active.shadowRoot;
      active = sr ? sr.activeElement : null;
    }

    // Layer 3 – whole-document edit mode
    if (document.designMode === "on") return true;

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
