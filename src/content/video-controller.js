/**
 * Video controller for TempoPilot.
 *
 * Central coordinator: wires together video finder, overlay, and settings.
 * Provides the public API for changing speed on the active video.
 */
const VideoController = (() => {
  let settings = null;
  let presetIndex = 0;

  async function init() {
    settings = await Settings.init();
    Overlay.configure(settings);

    // Register callbacks BEFORE init so the initial scan triggers them
    VideoFinder.onAdded((video) => {
      Overlay.update(video, video.playbackRate);
    });

    VideoFinder.onRemoved((video) => {
      Overlay.remove(video);
    });

    VideoFinder.init();

    // React to settings changes from the options page
    Settings.onChange((newSettings) => {
      settings = newSettings;
      Overlay.configure(settings);
      // Update all existing overlays visibility
      VideoFinder.getAll().forEach((v) => Overlay.applyVisibility(v));
    });
  }

  function setSpeed(video, speed) {
    speed = clamp(speed, settings.minSpeed, settings.maxSpeed);
    speed = Math.round(speed * 100) / 100;
    video.playbackRate = speed;
    Overlay.update(video, speed);
  }

  function increaseSpeed() {
    const video = VideoFinder.getActiveVideo();
    if (!video) return;
    setSpeed(video, video.playbackRate + settings.speedStep);
  }

  function decreaseSpeed() {
    const video = VideoFinder.getActiveVideo();
    if (!video) return;
    setSpeed(video, video.playbackRate - settings.speedStep);
  }

  function resetSpeed() {
    const video = VideoFinder.getActiveVideo();
    if (!video) return;
    setSpeed(video, settings.defaultSpeed);
  }

  function cyclePreset() {
    const video = VideoFinder.getActiveVideo();
    if (!video || !settings.presetSpeeds.length) return;
    presetIndex = (presetIndex + 1) % settings.presetSpeeds.length;
    setSpeed(video, settings.presetSpeeds[presetIndex]);
  }

  function toggleOverlay() {
    const newState = !Overlay.isVisible();
    Overlay.setVisible(newState);
    VideoFinder.getAll().forEach((v) => Overlay.applyVisibility(v));
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function getSettings() {
    return settings;
  }

  return { init, increaseSpeed, decreaseSpeed, resetSpeed, cyclePreset, toggleOverlay, getSettings };
})();

if (typeof globalThis.VideoController === "undefined") {
  globalThis.VideoController = VideoController;
}
