# Agent Guide

## Project goals

Concert Journey is a calm, projector-friendly visual backdrop for a live concert.
The current show has nine song-and-place stops, each with three photographs. Photos
rotate about once a minute, while the operator advances between songs manually
because performance timings are not predictable. A short animated plane route
connects adjacent stops.

Keep the presentation simple and readable from a distance. Song changes must
remain manual; only photos rotate automatically. The song order and number of
stops may change, so do not hardcode the current sequence or slide count elsewhere.

## Language

All presentation-facing text, including interface labels, place names, photo
descriptions, error messages, and keyboard hints, must be in Norwegian Bokmål.
Keep the document language set to `nb`. Preserve song titles as supplied unless
asked to translate them. Keep code, identifiers, comments, and technical
documentation in English.

## Architecture

- This is a static, offline-first site built with plain HTML, CSS, and JavaScript.
  There is no build step, package manager, backend, or runtime network dependency.
- `index.html` provides the stage and controls. It loads `slides.js` before
  `app.js` with `defer`; preserve that order because the app reads the config
  during initialization.
- `slides.js` defines `window.CONCERT_CONFIG`, the source of truth for photo
  timing and the ordered slide data. Each slide has an `id`, `song`, `place`,
  geographic `point`, and `photos`.
- `app.js` renders the configured slides, crossfades photos between two image
  layers, handles keyboard and button controls, toggles fullscreen, and animates
  the route between neighboring slide coordinates.
- `style.css` contains the presentation layout, typography, and visual
  transitions. Keep text and controls legible on a large screen.
- `assets/photos/` contains the locally bundled photographs.
  `assets/world-map.svg` is the map used by the flight animation, based on the
  public-domain Natural Earth 1:110m land dataset.

## Changing songs, places, or photos

- Reorder the complete slide objects in `slides.js`. The route is calculated
  from the current array order; do not maintain a separate route sequence.
- Keep each `id` unique. Coordinates use decimal-degree `latitude` and
  `longitude`; they determine the map position and route.
- Store slideshow images locally and use relative paths. For each photo, keep
  useful `alt` text and its `credit`, `license`, and `source` in the slide data.
  Update `PHOTO_CREDITS.md` whenever photos change. The optional `position` field
  can set the image's CSS `object-position`.
- Show a small credit for the currently visible photo with the photographer,
  exact license, and a link to its source. Keep that credit visible when `H`
  hides controls.
- `photoIntervalMs` is measured in milliseconds; the current value is 60 seconds.
  Do not add automatic song advancement.
- Keep asset URLs relative so the slideshow works both when opened locally and
  when hosted under a GitHub Pages project path.

## Controls and behavior to preserve

- `Space` or `Right Arrow`, and the on-screen right arrow, advance one song.
- `Left Arrow` and the on-screen left arrow go back one song.
- `F` and the Fullscreen button toggle fullscreen.
- `H` hides or shows the slide number, fullscreen button, navigation arrows, and
  keyboard hints. Keep the project mark, current song, and place visible. The
  animated route remains visible.
- Preserve visible error messages for missing photos, meaningful image alt text,
  and the reduced-motion preference for the flight animation.

## Running and checking changes

Open `index.html` directly in a browser; no server or installation is required.
There is currently no automated test runner. For changes to the presentation,
manually check photo loading and rotation, previous/next controls, the map
transition, fullscreen, photo-credit updates, and browser-console errors. Verify
credits remain visible when `H` hides controls. Keep the site usable offline.
