# Claude RTL

A Chrome extension that makes [claude.ai](https://claude.ai) right-to-left, built for Persian and Arabic speakers.

---

## Features

- RTL layout for all chat messages
- Mixed Persian/English paragraphs each pick the correct direction automatically (an English sentence inside a Persian reply, or vice versa, is no longer forced right-to-left)
- Math formulas (KaTeX) always render left-to-right and are isolated from the surrounding RTL text, so operators, parentheses and digits don't get reordered
- Works during streaming (real-time responses)
- Code blocks stay left-to-right
- Toggle on/off via the popup
- State persists across sessions

---

## Installation (Developer Mode)

1. Clone the repo:

```bash
git clone git@github.com:mh-daneshvar/claude-rtl.git
```

2. Open Chrome and go to `chrome://extensions`

3. Enable **Developer mode** (top right)

4. Click **Load unpacked** and select the `claude-rtl` folder

5. Open [claude.ai](https://claude.ai) — RTL is active by default

---

## File Structure

```
claude-rtl/
├── .gitignore
├── LICENSE
├── README.md
├── manifest.json      # Extension config
└── src/
    ├── content.js     # Injects RTL styles into the page
    ├── popup.html     # Popup UI
    ├── popup.js       # Popup logic
    └── icons/
        ├── icon16.png
        ├── icon32.png
        ├── icon48.png
        └── icon128.png
```

---

## Updating the Extension

After changing any file, go to `chrome://extensions` and click the reload button next to the extension.

---

## Note

Claude.ai's CSS classes may change with updates. If the extension stops working, use DevTools (F12) to find the new class names and update `content.js`.

---

## License

MIT