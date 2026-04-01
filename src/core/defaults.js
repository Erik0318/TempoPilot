/**
 * Default settings for TempoPilot.
 * Versioned to support future migrations.
 */
const TempoPilotDefaults = {
  SCHEMA_VERSION: 1,

  settings: {
    schemaVersion: 1,

    // Playback
    speedStep: 0.25,
    minSpeed: 0.25,
    maxSpeed: 5.0,
    defaultSpeed: 1.0,
    presetSpeeds: [0.5, 1.0, 1.25, 1.5, 2.0, 3.0],

    // Overlay
    showOverlay: true,
    overlayAutoHideMs: 2000, // 0 = always visible when active

    // Keyboard shortcuts (code = physical key for reliable matching)
    shortcuts: {
      increaseSpeed: { code: "Period", key: ">", ctrlKey: false, shiftKey: true, altKey: false },
      decreaseSpeed: { code: "Comma", key: "<", ctrlKey: false, shiftKey: true, altKey: false },
      resetSpeed: { code: "Slash", key: "?", ctrlKey: false, shiftKey: true, altKey: false },
      toggleOverlay: { code: "KeyO", key: "O", ctrlKey: false, shiftKey: true, altKey: true },
      cyclePreset: { code: "KeyP", key: "P", ctrlKey: false, shiftKey: true, altKey: true },
    },

    // Future extension points:
    // - perSiteRules: {}
    // - profiles: []
    // - overlayTheme: "default"
    // - domainDefaults: {}
  },
};

if (typeof globalThis.TempoPilotDefaults === "undefined") {
  globalThis.TempoPilotDefaults = TempoPilotDefaults;
}
