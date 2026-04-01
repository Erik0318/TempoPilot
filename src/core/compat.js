/**
 * Browser compatibility layer.
 * Wraps browser-specific APIs behind a unified interface.
 * Chrome uses `chrome.*`, Firefox uses `browser.*` with Promises.
 */
const Compat = (() => {
  const api = typeof browser !== "undefined" ? browser : chrome;

  return {
    storage: {
      get(keys) {
        return new Promise((resolve, reject) => {
          api.storage.local.get(keys, (result) => {
            if (api.runtime?.lastError) {
              reject(api.runtime.lastError);
            } else {
              resolve(result);
            }
          });
        });
      },
      set(items) {
        return new Promise((resolve, reject) => {
          api.storage.local.set(items, () => {
            if (api.runtime?.lastError) {
              reject(api.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      },
    },

    runtime: {
      onMessage: api.runtime.onMessage,
      sendMessage(msg) {
        return new Promise((resolve, reject) => {
          api.runtime.sendMessage(msg, (response) => {
            if (api.runtime?.lastError) {
              reject(api.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        });
      },
      getURL(path) {
        return api.runtime.getURL(path);
      },
    },

    // Future: add tabs, commands, notifications wrappers as needed
  };
})();

if (typeof globalThis.Compat === "undefined") {
  globalThis.Compat = Compat;
}
