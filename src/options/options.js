/**
 * Options page script for TempoPilot.
 * Loads settings, renders form, and saves changes.
 */
(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  let settings = null;
  let pendingShortcuts = {};

  // --- Dark mode ---

  function initTheme() {
    const api = typeof browser !== "undefined" ? browser : chrome;
    api.storage.local.get("tempopilot_darkmode", (result) => {
      const dark = result.tempopilot_darkmode ?? window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(dark);
      $("#darkMode").checked = dark;
    });

    $("#darkMode").addEventListener("change", (e) => {
      const dark = e.target.checked;
      applyTheme(dark);
      api.storage.local.set({ tempopilot_darkmode: dark });
    });
  }

  function applyTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }

  initTheme();

  // --- Load & render ---

  async function load() {
    settings = await TempoPilotStorage.load();
    render(settings);
  }

  function render(s) {
    $("#speedStep").value = s.speedStep;
    $("#minSpeed").value = s.minSpeed;
    $("#maxSpeed").value = s.maxSpeed;
    $("#defaultSpeed").value = s.defaultSpeed;
    $("#presetSpeeds").value = s.presetSpeeds.join(", ");
    $("#showOverlay").checked = s.showOverlay;
    $("#overlayAutoHideMs").value = s.overlayAutoHideMs;

    pendingShortcuts = structuredClone(s.shortcuts);
    $$(".shortcut-input").forEach((input) => {
      const action = input.dataset.action;
      input.value = Keymap.format(pendingShortcuts[action]);
    });
  }

  // --- Shortcut capture ---

  $$(".shortcut-input").forEach((input) => {
    input.addEventListener("keydown", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const action = input.dataset.action;

      // Allow clearing a shortcut with Escape or Backspace
      if (e.key === "Escape" || e.key === "Backspace") {
        pendingShortcuts[action] = { code: "", key: "", ctrlKey: false, shiftKey: false, altKey: false };
        input.value = "Not set";
        return;
      }

      const captured = Keymap.capture(e);
      if (!captured) return;

      // Check for conflicts
      const conflict = findConflict(captured, action);
      if (conflict) {
        flash(`Conflict with "${formatAction(conflict)}"`, true);
        return;
      }

      pendingShortcuts[action] = captured;
      input.value = Keymap.format(captured);
    });
  });

  function findConflict(shortcut, excludeAction) {
    for (const [action, sc] of Object.entries(pendingShortcuts)) {
      if (action === excludeAction) continue;
      if (!sc.code && !sc.key) continue;
      const sameKey = shortcut.code && sc.code
        ? sc.code === shortcut.code
        : sc.key === shortcut.key;
      if (
        sameKey &&
        sc.ctrlKey === shortcut.ctrlKey &&
        sc.shiftKey === shortcut.shiftKey &&
        sc.altKey === shortcut.altKey
      ) {
        return action;
      }
    }
    return null;
  }

  function formatAction(action) {
    const names = {
      increaseSpeed: "Increase speed",
      decreaseSpeed: "Decrease speed",
      resetSpeed: "Reset speed",
      toggleOverlay: "Toggle overlay",
      cyclePreset: "Cycle presets",
    };
    return names[action] || action;
  }

  // --- Save ---

  $("#save").addEventListener("click", async () => {
    const newSettings = gatherSettings();
    if (!newSettings) return;
    await TempoPilotStorage.save(newSettings);
    settings = newSettings;
    flash("Settings saved");
  });

  function gatherSettings() {
    const speedStep = parseFloat($("#speedStep").value);
    const minSpeed = parseFloat($("#minSpeed").value);
    const maxSpeed = parseFloat($("#maxSpeed").value);
    const defaultSpeed = parseFloat($("#defaultSpeed").value);
    const overlayAutoHideMs = parseInt($("#overlayAutoHideMs").value, 10) || 0;

    // Validate
    if (isNaN(speedStep) || speedStep <= 0) { flash("Invalid speed step", true); return null; }
    if (isNaN(minSpeed) || minSpeed <= 0) { flash("Invalid minimum speed", true); return null; }
    if (isNaN(maxSpeed) || maxSpeed < minSpeed) { flash("Max must be ≥ min", true); return null; }
    if (isNaN(defaultSpeed) || defaultSpeed < minSpeed || defaultSpeed > maxSpeed) {
      flash("Default speed out of range", true); return null;
    }

    // Parse presets
    const rawPresets = $("#presetSpeeds").value;
    const presetSpeeds = rawPresets
      .split(",")
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    return {
      schemaVersion: TempoPilotDefaults.SCHEMA_VERSION,
      speedStep,
      minSpeed,
      maxSpeed,
      defaultSpeed,
      presetSpeeds,
      showOverlay: $("#showOverlay").checked,
      overlayAutoHideMs,
      shortcuts: structuredClone(pendingShortcuts),
    };
  }

  // --- Reset ---

  $("#reset").addEventListener("click", async () => {
    const defaults = structuredClone(TempoPilotDefaults.settings);
    await TempoPilotStorage.save(defaults);
    settings = defaults;
    render(defaults);
    flash("Reset to defaults");
  });

  // --- Status flash ---

  function flash(msg, isError = false) {
    const el = $("#status");
    el.textContent = msg;
    el.style.color = isError ? "#ff3b30" : "#34c759";
    el.classList.add("show");
    clearTimeout(flash._timer);
    flash._timer = setTimeout(() => el.classList.remove("show"), 2000);
  }

  // --- Init ---
  load();
})();
