<p align="center">
  <img src="icons/icon128.png" alt="TempoPilot" width="80">
</p>

<h1 align="center">TempoPilot</h1>

<p align="center">
  <strong>Control any HTML5 video speed, right from your keyboard.</strong><br>
  A tiny browser extension.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/manifest-v3-blue?style=flat-square" alt="Manifest V3">
  <img src="https://img.shields.io/badge/size-~15kb-green?style=flat-square" alt="Size">
  <img src="https://img.shields.io/badge/frameworks-none-lightgrey?style=flat-square" alt="No frameworks">
</p>

---

## What it does

You're watching a video. You want it faster. Or slower. You press a key — done.

TempoPilot gives you keyboard shortcuts to speed up, slow down, or reset any HTML5 video on any website. A small overlay in the corner shows your current speed, then fades away.

That's it. Nothing else. It stays out of your way.

### ⌨️ Default shortcuts

| | |
|---|---|
| ⏩ **Speed up** | `Shift + >` |
| ⏪ **Slow down** | `Shift + <` |
| 🔄 **Reset to 1×** | `Shift + ?` |
| 🔁 **Cycle presets** | `Alt + Shift + P` |
| 👁️ **Toggle overlay** | `Alt + Shift + O` |

All shortcuts are rebindable. Open the extension settings, click any shortcut field, press your new combo.

### 🎯 How it picks the right video

If there's one video on the page, it controls that one. If there are a few:

1. The one your mouse is hovering over
2. The one you most recently clicked or played
3. The largest visible playing video
4. The largest visible video
5. First on the page (last resort)

Works on YouTube, Vimeo, Twitch, lecture platforms — anything with a standard `<video>` element.

### 🌙 Dark mode

The settings page has a dark mode toggle in the top-right corner. It respects your system preference by default and remembers your choice.

---

## Install

### Firefox

[![Get the add-on](https://img.shields.io/badge/Firefox-Install%20from%20AMO-FF7139?style=flat-square&logo=firefox)](https://addons.mozilla.org/en-US/firefox/addon/tempopilot/)

### Edge

[![Get the add-on](https://img.shields.io/badge/Edge-Install%20from%20Add--ons-0078D7?style=flat-square&logo=microsoftedge)](http://microsoftedge.microsoft.com/addons/detail/tempopilot/oipgiibkbnkgnkmplapinfdiipimmone)

### Chrome / Chromium (manual)

1. Go to `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**
4. Pick the `TempoPilot` folder

### 🐧 Linux terminal quick-open

```bash
# Chrome
google-chrome chrome://extensions &

# Chromium
chromium-browser chrome://extensions &

# Edge — or install from the store link above
microsoft-edge edge://extensions &

# Firefox — or install from the AMO link above
firefox about:debugging#/runtime/this-firefox &
```

> Tip: append `& disown` if you want to close the terminal afterwards.

---

## Project structure

```
TempoPilot/
├── manifest.json
├── icons/
├── src/
│   ├── background.js            # Opens settings on icon click
│   ├── core/
│   │   ├── defaults.js          # Default settings + schema version
│   │   ├── compat.js            # Chrome/Firefox API wrapper
│   │   ├── keymap.js            # Physical-key matching (event.code)
│   │   ├── storage.js           # Load, save, migrate settings
│   │   └── settings.js          # Reactive settings for content scripts
│   ├── content/
│   │   ├── video-finder.js      # Finds videos via MutationObserver
│   │   ├── overlay.js           # Speed badge on the video
│   │   ├── video-controller.js  # Coordinates everything
│   │   └── page-hotkeys.js      # Keyboard listener + bootstrap
│   └── options/
│       ├── options.html
│       ├── options.css          # Light + dark theme via CSS variables
│       └── options.js
└── README.md
```

---

## Future extension boundaries

The codebase is ready for these without rewriting core code:

- **Per-site rules** → new field in `defaults.js`, new module in `core/`
- **Overlay themes** → CSS variables already in place, add a theme picker
- **Preset profiles** → extend `presetSpeeds` to named profile objects
- **Import/export** → settings are one JSON blob, just serialize it
- **Domain defaults** → add a `domainDefaults` map to the schema
- **More media controls** → add actions to `video-controller.js`

Settings are versioned (`schemaVersion`), migrations are safe.

---
---

<p align="center">
  <img src="icons/icon128.png" alt="TempoPilot" width="80">
</p>

<h1 align="center">TempoPilot <sub><sup>🇺🇦</sup></sub></h1>

<p align="center">
  <strong>Керуй швидкістю будь-якого відео прямо з клавіатури.</strong><br>
  Маленьке розширення для браузера. Без акаунтів, без трекінгу, без зайвого.
</p>

---

## Що воно робить

Дивишся відео. Хочеш швидше. Або повільніше. Натискаєш клавішу — готово.

TempoPilot дає тобі хоткеї для прискорення, сповільнення або скидання швидкості будь-якого HTML5 відео на будь-якому сайті. Маленький оверлей у кутку показує поточну швидкість і зникає сам.

Усе. Нічого зайвого. Просто працює.

### ⌨️ Хоткеї за замовчуванням

| | |
|---|---|
| ⏩ **Швидше** | `Shift + >` |
| ⏪ **Повільніше** | `Shift + <` |
| 🔄 **Скинути до 1×** | `Shift + ?` |
| 🔁 **Перебрати пресети** | `Alt + Shift + P` |
| 👁️ **Показати/сховати оверлей** | `Alt + Shift + O` |

Усі хоткеї можна перепризначити. Відкрий налаштування, клікни на поле, натисни нову комбінацію.

### 🎯 Як обирається відео

Якщо на сторінці одне відео — керується ним. Якщо кілька:

1. Те, над яким зараз курсор
2. Те, з яким нещодавно взаємодіяв (клік, play)
3. Найбільше видиме відео, що грає
4. Найбільше видиме відео
5. Перше на сторінці (крайній варіант)

Працює на YouTube, Vimeo, Twitch, лекційних платформах — будь-де, де є стандартний `<video>`.

### 🌙 Темна тема

У налаштуваннях є перемикач темної теми у верхньому правому куті. За замовчуванням підхоплює системну тему і запам'ятовує вибір.

---

## Встановлення

### Firefox

[![Встановити](https://img.shields.io/badge/Firefox-Встановити%20з%20AMO-FF7139?style=flat-square&logo=firefox)](https://addons.mozilla.org/en-US/firefox/addon/tempopilot/)

### Edge

[![Встановити](https://img.shields.io/badge/Edge-Встановити%20з%20Add--ons-0078D7?style=flat-square&logo=microsoftedge)](http://microsoftedge.microsoft.com/addons/detail/tempopilot/oipgiibkbnkgnkmplapinfdiipimmone)

### Chrome / Chromium (вручну)

1. Відкрий `chrome://extensions`
2. Увімкни **Режим розробника** (вгорі справа)
3. Натисни **Завантажити розпаковане**
4. Вибери папку `TempoPilot`

### 🐧 Термінал (Linux)

```bash
# Chrome
google-chrome chrome://extensions &

# Chromium
chromium-browser chrome://extensions &

# Edge — або встанови за посиланням вище
microsoft-edge edge://extensions &

# Firefox — або встанови за посиланням вище
firefox about:debugging#/runtime/this-firefox &
```

> Порада: додай `& disown`, щоб потім закрити термінал.
