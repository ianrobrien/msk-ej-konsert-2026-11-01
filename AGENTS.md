# Agent Guide

## Project goals

Concert Journey is a calm, projector-friendly visual backdrop for a live concert.
The current show has nine song-and-place stops, each with three photographs,
framed by welcome, pause, and closing cards. Photos rotate about once a minute.
The operator advances manually because performance timings are not predictable.
The show begins with a 60-second flight from Norway to the first song; route
animations between song stops also take 60 seconds and wait for confirmation
before the destination photos start.

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
  timing, flight duration, and ordered slide data. Song slides have an `id`,
  `song`, `place`, geographic `point`, and `photos`. Interstitial slides use
  `type: "interstitial"`, an `id`, a Norwegian `title`, and an empty `photos`
  array. The welcome or another interstitial can define `routeOrigin`;
  `routeFromPreviousSong` and `routeToNextSong` configure incoming and outgoing
  journey legs.
- `app.js` renders the configured slides, crossfades photos between two image
  layers, handles keyboard and button controls, toggles fullscreen, animates
  routes between song stops, and waits for a manual keypress after arrival
  before starting the destination photo loop.
- `style.css` contains the presentation layout, typography, and visual
  transitions. Keep text and controls legible on a large screen.
- `assets/photos/` contains the locally bundled photographs.
  `assets/world-map.svg` is the map used by the flight animation, based on the
  public-domain Natural Earth 1:50m land dataset. It uses the Robinson
  projection in a 1200x600 viewBox, covering 90 degrees north to 90 degrees
  south. Keep it aligned with the route projection in `app.js`.

## Changing songs, places, or photos

- Reorder the complete slide objects in `slides.js`. The route is calculated
  from the current array order; do not maintain a separate route sequence.
  Interstitial cards remain part of the show order. Use route metadata on an
  interstitial when a journey needs to arrive at or depart from that card's
  location.
- Use an interior representative coordinate for each route stop, based on the
  corresponding country geometry in `assets/world-map.svg`; avoid coastal or
  border locations that make the large route markers appear in neighboring
  countries.
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
  `flightDurationMs` is measured in milliseconds; the current value is 60
  seconds. Do not add automatic song or photo-start advancement.
- Keep asset URLs relative so the slideshow works both when opened locally and
  when hosted under a GitHub Pages project path.

## Controls and behavior to preserve

- `Space` or `Right Arrow`, and the on-screen right arrow, advance to the next
  card or song. A song-to-song change starts the route; pressing again during
  the flight cancels it and shows the next country's photos, while waiting for
  arrival requires a separate press to start them. The welcome card starts a
  route from Norway to the first song; `routeFromPreviousSong` and
  `routeToNextSong` start their configured incoming and outgoing legs.
- `Left Arrow` and the on-screen left arrow go back one card or song. During a
  flight, Left cancels it to an interstitial immediately before the destination,
  or shows the previous country's photos when there is no such card. At
  arrival, `routeFromPreviousSong` reverses that leg; other interstitials are
  visited in order before returning farther back. Direct song routes otherwise
  animate in reverse and wait for confirmation.
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
