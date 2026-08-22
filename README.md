# CalorieCapture

Phone-and-desktop fitness app from the ISE 588 Team Red product deck.

One-tap meal photos, gym-machine tutorials, calories in vs out, habit reminders, and a beginner routine generator. Static PWA — no backend, no build step.

## Live site

After GitHub Pages is on: **https://k14shitija.github.io/calorie-capture/**

On a phone: open that URL → browser menu → **Add to Home Screen**.

## What you can do

- Set a daily calorie target (or try the John demo)
- Photograph a meal, pick plate size, edit the on-device estimate
- Search gym machines and follow short form tutorials
- Generate a 20–60 minute beginner routine
- Track water, streaks, badges, and a friend challenge board
- Dark / light mode. Data stays in this browser.

Estimates are educational, not medical advice.

## Run locally

```bash
python3 -m http.server 8080
```

Open http://localhost:8080/

## Tests

```bash
node tests/test_engine.js
```

## Deploy on GitHub Pages

A GitHub Actions workflow deploys `main` to Pages. If the first run needs approval, open **Settings → Pages** and set source to **GitHub Actions**, or pick **Deploy from a branch** → `main` / `/ (root)`.

Live URL: https://k14shitija.github.io/calorie-capture/
