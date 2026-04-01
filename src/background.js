/**
 * Service worker for TempoPilot.
 * Minimal — only handles toolbar icon click to open settings.
 */
const api = typeof browser !== "undefined" ? browser : chrome;

api.action.onClicked.addListener(() => {
  api.runtime.openOptionsPage();
});
