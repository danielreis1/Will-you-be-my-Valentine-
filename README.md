# Will You Be My Valentine?

This project is an interactive static webpage with a configurable four-question flow. Please use this code as inspiration.

---

## Respect Open-Source

I built this for **fun & learning**. If you fork or modify it:

- **Use it for creativity, personal projects, or learning**
- **Give proper credit when using it in public**
- **Respect the original creator's work**

---

## How It Works

Question text, answer labels, answer actions, ending text, and all question media paths are centralized in `content.json`.

- `pageTitles` configures browser page titles. The question title template uses `{number}` for the current question number.
- `screenshotPlaceholders` configures page screenshot fallback labels. The defaults remain exactly `1`, `2`, `3`, `4`, and `celebration screenshot`, so the current full-screen placeholders remain when images do not exist.
- `images` maps image numbers `1` through `13` to media paths. The literal `path1` through `path4` and `pathCelebration` values intentionally render as full-screen, borderless numbered or named background placeholders with centered controls; they are not media cards.
- Valid real paths replace those placeholders with full-viewport, centered, cover-sized images. If a path fails to load, its full-screen placeholder remains visible. The heading and buttons stay centered directly above either background.
- Button backgrounds `5` through `13` are separate and unchanged. They map exactly as follows: question 1 uses images `5` and `6`, question 2 uses `7` and `8`, question 3 uses `9` and `10`, question 4 uses `11` and `12`, and the switch-seats `ok` button uses `13`.
- When paths `5` through `13` are unset or fail to load, the corresponding image number appears as a watermark behind the still-visible button label. Valid paths become centered, cover-sized button backgrounds while the text remains readable.
- `questions` contains the four numbered questions, their image references, and their answers.
- `endings` contains the celebration and switch-seats messages.
- All quiz buttons are larger and centered. The final celebration page still has no button.
- On question 3, every press of `No` compounds `Yes` by `+5%` and `No` by `-5%` (`1.05^n` and `0.95^n`, respectively). `No` changes to `please` and is never programmatically hidden or disabled.
- On question 4, `sim` goes directly to the standard celebration. `I will drive then` shows `well switch seats then` with an `ok` button; pressing `ok` reaches the same `Here's to more birthdays, love, and adventures!` celebration page.
- The application is designed to fit within one viewport without page scrolling.

Edit `content.json` to personalize the flow without changing the page structure or interaction code.

---

## How to Use

The site fetches `content.json`, so it must be served over HTTP by static hosting rather than opened directly with `file://`.

From the project directory, a simple dependency-free local server is:

```sh
python3 -m http.server
```

Then open `http://localhost:8000` in your browser.

---

## Code Overview

- `content.json`: The questions, labels, actions, endings, and media paths.
- `index.html`: The page structure.
- `styles.css`: The page styling.
- `script.js`: The question flow and button interactions.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
