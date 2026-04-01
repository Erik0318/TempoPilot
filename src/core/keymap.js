/**
 * Keymap utilities for TempoPilot.
 * Uses event.code (physical key) for matching — immune to Shift/layout changes.
 * Stores event.key alongside for display fallback.
 */
const Keymap = (() => {
  /**
   * Check if a keyboard event matches a shortcut definition.
   * Prefers code-based matching; falls back to key-based for legacy shortcuts.
   */
  function matches(event, shortcut) {
    if (!shortcut || (!shortcut.code && !shortcut.key)) return false;

    const modifiersMatch =
      !!event.ctrlKey === !!shortcut.ctrlKey &&
      !!event.shiftKey === !!shortcut.shiftKey &&
      !!event.altKey === !!shortcut.altKey;

    if (!modifiersMatch) return false;

    // Prefer code (physical key, not affected by Shift/layout)
    if (shortcut.code) {
      return event.code === shortcut.code;
    }
    // Fallback for legacy saved shortcuts without code
    return event.key.toLowerCase() === shortcut.key.toLowerCase();
  }

  /**
   * Format a shortcut descriptor as a human-readable string.
   */
  function format(shortcut) {
    if (!shortcut || (!shortcut.key && !shortcut.code)) return "Not set";
    const parts = [];
    if (shortcut.ctrlKey) parts.push("Ctrl");
    if (shortcut.altKey) parts.push("Alt");
    if (shortcut.shiftKey) parts.push("Shift");
    const displayKey = shortcut.code ? codeToDisplay(shortcut.code) : shortcut.key;
    parts.push(displayKey.length === 1 ? displayKey.toUpperCase() : displayKey);
    return parts.join(" + ");
  }

  /**
   * Map event.code values to short readable names.
   */
  function codeToDisplay(code) {
    if (!code) return "";
    if (code.startsWith("Key")) return code.slice(3);
    if (code.startsWith("Digit")) return code.slice(5);
    if (code.startsWith("Numpad")) return "Num" + code.slice(6);
    const map = {
      Period: ".", Comma: ",", Slash: "/", Backslash: "\\",
      BracketLeft: "[", BracketRight: "]", Semicolon: ";",
      Quote: "'", Backquote: "`", Minus: "-", Equal: "=",
      Space: "Space", Enter: "Enter", Tab: "Tab",
      Escape: "Esc", Backspace: "Backspace", Delete: "Delete",
      ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right",
      Home: "Home", End: "End", PageUp: "PgUp", PageDown: "PgDn",
    };
    return map[code] || code;
  }

  /**
   * Parse a KeyboardEvent into a storable shortcut object for the settings UI.
   * Stores both code (for matching) and key (for fallback display).
   */
  function capture(e) {
    // Ignore bare modifier keys
    if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) return null;
    return {
      code: e.code,
      key: e.key,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
    };
  }

  return { matches, format, capture, codeToDisplay };
})();

if (typeof globalThis.Keymap === "undefined") {
  globalThis.Keymap = Keymap;
}
