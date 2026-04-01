/**
 * Storage layer for TempoPilot settings.
 * Handles loading, saving, and migration of settings.
 */
const Storage = (() => {
  const STORAGE_KEY = "tempopilot_settings";

  function migrate(saved) {
    // Current version is 1. Add migration steps here for future versions.
    // Example:
    // if (saved.schemaVersion < 2) { saved.newField = "default"; saved.schemaVersion = 2; }
    return saved;
  }

  async function load() {
    const defaults = TempoPilotDefaults.settings;
    try {
      const result = await Compat.storage.get(STORAGE_KEY);
      if (!result[STORAGE_KEY]) {
        return structuredClone(defaults);
      }
      let saved = result[STORAGE_KEY];
      saved = migrate(saved);
      // Merge with defaults so new fields are always present
      return deepMerge(structuredClone(defaults), saved);
    } catch {
      return structuredClone(defaults);
    }
  }

  async function save(settings) {
    settings.schemaVersion = TempoPilotDefaults.SCHEMA_VERSION;
    await Compat.storage.set({ [STORAGE_KEY]: settings });
  }

  function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key]) &&
        typeof target[key] === "object" &&
        !Array.isArray(target[key])
      ) {
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  return { load, save, STORAGE_KEY };
})();

if (typeof globalThis.Storage === "undefined" || globalThis.Storage === window.Storage) {
  globalThis.TempoPilotStorage = Storage;
}
