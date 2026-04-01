/**
 * Settings accessor for content scripts.
 * Provides a cached, reactive interface to the current settings.
 * Listens for storage changes and notifies subscribers.
 */
const Settings = (() => {
  let current = null;
  const listeners = new Set();

  async function init() {
    current = await TempoPilotStorage.load();
    // Listen for changes from options page or other tabs
    const api = typeof browser !== "undefined" ? browser : chrome;
    api.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[TempoPilotStorage.STORAGE_KEY]) {
        current = changes[TempoPilotStorage.STORAGE_KEY].newValue;
        listeners.forEach((fn) => fn(current));
      }
    });
    return current;
  }

  function get() {
    return current;
  }

  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return { init, get, onChange };
})();

if (typeof globalThis.Settings === "undefined") {
  globalThis.Settings = Settings;
}
