# Agent Guide

## Project goals

Concert Journey is a calm, projector-friendly visual backdrop for a live concert.
The current show has nine song-and-place stops, each with five photographs,
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
  There is no production build step, package manager, backend, or runtime network
  dependency. Deno is only needed to regenerate route-map assets after slide or
  map changes.
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
  `assets/world-map.svg` is the authoritative map source, based on the
  public-domain Natural Earth 1:50m land dataset. Route-specific SVG backgrounds
  in `assets/route-maps/` are generated from the current `slides.js` route order
  and share its Robinson projection. Regenerate them after changing slide order,
  route endpoints, or projection by running this from the repository root:

  ```sh
  deno run --allow-read=slides.js,assets/world-map.svg,assets/route-maps \
    --allow-write=assets/route-maps scripts/generate-route-maps.js
  ```

  The source map uses a 1200x600 viewBox covering 90 degrees north to 90 degrees
  south; the generated manifest is loaded before `app.js`. Keep the generator's
  route discovery in sync with `app.js` when transition rules change.

### Generated route-map assets and colors

The route backgrounds are SVGs, not PNGs. `scripts/generate-route-maps.js`
reads `slides.js` and `assets/world-map.svg`, finds route pairs using the same
transition rules as `app.js`, and writes one SVG per pair plus
`assets/route-maps/manifest.js`. Each generated SVG keeps the full source-map
geometry and changes its `viewBox` to frame the route; it remains vector and
does not geometrically clip paths to the route bounds. The generator scales
each explicit `stroke-width` by the cropped viewBox width divided by 1200 so
close-up borders and graticules stay thin. Both travel directions use the same
generated SVG. Generated SVGs and the manifest are outputs; do not edit them
by hand.

Change colors in their source files, not in generated route maps:

- The map SVG has transparent water, so the water color comes from
  `style.css`'s `.map-frame` background (`--map-water`).
- Land fill, graticule lines, and country borders are the final three `<use>`
  elements in `assets/world-map.svg`. The generator copies the source SVG
  styling into every route background while changing its `viewBox` and
  stroke widths.
- The animated route, endpoint markers, and vehicles are separate SVG markup
  in `index.html`, with their colors in `style.css`. Route lines, dots, and
  markers use `--travel-red`; update their hard-coded red glow filters at the
  same time if that accent changes.
- Train sleepers and rails have separate colors in `.route-track-sleepers`
  and `.route-track-rails`; the rails' glow is separately hard-coded.
- Vehicle fills and outlines are set by the `.plane-*`, `.train-*`, and
  `.boat-*` rules in `style.css`. These use shared colors such as `--ice-blue`
  and `--text-primary` as well as literal fills and outlines, so inspect the
  full vehicle rule block when changing the vehicle palette.
- The general stage palette is declared in `style.css`'s `:root`; some
  translucent backgrounds, gradients, text, and shadows use literal `rgb()`
  colors rather than variables. The browser theme color is also set in
  `index.html` and should stay coordinated with the stage background.

Regenerate route maps after changing `assets/world-map.svg` styling or its
geometry, as well as after route-order, endpoint, or projection changes. CSS
changes to the map water or animated overlay do not require regeneration.
Use the generation command above.

### Route projection and endpoint alignment

Route anchors in `slides.js` use decimal-degree latitude and longitude. When a
slide has `routeOrigin`, that location supplies its endpoint. The generator and
`app.js` project each endpoint into the source map's 1200x600 coordinates using
the same Robinson projection: `robinsonX` and `robinsonY` are linearly
interpolated at five-degree latitude intervals, and the projected map is scaled
to fit the source dimensions with `xFactor: 0.8487` and `yFactor: 1.3523`.
Keep the `project()` implementations and projection constants in
`scripts/generate-route-maps.js` and `app.js` in sync.

For each latitude, interpolate the neighboring entries in the projection
tables at `abs(latitude) / 5`. With the resulting `xScale` and `yScale`, the
projection is:

```text
projectionTop = yFactor * robinsonY(90)
projectionBottom = -yFactor * robinsonY(90)
mapScale = min(1200 / (2 * xFactor * pi),
               600 / (projectionTop - projectionBottom))
topMargin = (600 - (projectionTop - projectionBottom) * mapScale) / 2
longitudeRadians = longitude * pi / 180
northing = sign(latitude) * yFactor * yScale
mapX = 600 + xFactor * longitudeRadians * xScale * mapScale
mapY = topMargin + (projectionTop - northing) * mapScale
```

The route is a quadratic Bézier from projected start to finish. Let
`distance = hypot(end.x - start.x, end.y - start.y)`; its control point is:

```text
controlX = (start.x + end.x) / 2
controlY = max(24, (start.y + end.y) / 2 - min(120, distance * 0.18))
```

The generator frames the exact curve bounds in a 2:1 viewBox, targeting a 72%
route fill and capping zoom at 18x. To repeat that calculation, it chooses
`width = max(1200 / 18, bounds.width / 0.72, bounds.height * 2 / 0.72)`,
`height = width / 2`, then centers that viewBox on the curve bounds. If the
chosen width is at least 1200, it uses the full `[0, 0, 1200, 600]` map.

The start and finish dots are not independently positioned: `app.js` projects
the same endpoint coordinates used by the route, then maps them into the
generated viewBox for the 1200x600 overlay:

```text
overlayX = (mapX - viewBoxX) * 1200 / viewBoxWidth
overlayY = (mapY - viewBoxY) * 600 / viewBoxHeight
```

The map image and route overlay must use the same fit. Keep `.map-art` at
`object-fit: cover` and the route SVG at
`preserveAspectRatio="xMidYMid slice"` so both crop the 2:1 artwork identically
when the flex layout compresses the frame. Pairing `cover` with `meet` shifts
the overlay; pairing `contain` with `meet` can leave water-colored side margins.

If a dot appears off land, first verify or adjust the slide's geographic point
against `assets/world-map.svg`, rerun the route-map generator, and reload the
page. If the dot and map still disagree, check the map/overlay fit above, then
compare the projection and viewBox conversion in `app.js` with the generator.
Do not add a separate dot offset: the dot and route must share the same endpoint.

## Color palette and graphics

- The map palette is split between `style.css` and `assets/world-map.svg`:
  `--map-water` (`#286bad`) colors the water background, while the SVG uses
  `#329b72` for land and `#f2f6ff` for borders and graticule lines. Update both
  files together when changing the map palette; preserve the map geometry and
  projection.
- The `style.css` root variables define the stage palette: `--night`,
  `--night-panel`, and `--night-mid` are dark backgrounds; `--text-primary`
  is the main light text/detail color; `--ice-blue` is used in vehicle artwork.
  `--travel-red` (`#d95d57`) colors route dots, active routes, and endpoint
  outlines. `--travel-gold` (`#f1d06a`) is used for train rails.
- Route and endpoint glow filters use literal RGB values matching the travel
  variables. Update those filters when changing the corresponding colors.
  Check contrast for route marks, endpoints, and vehicle artwork against both
  the blue water and green land.
- Preserve the vehicle-specific route widths when changing colors: route dots
  are 2.5px by default and 7.5px for boats and trains; the active route is 3px
  by default and 9px for boats, and is hidden for trains; train rails are 2.5px.

## Changing songs, places, or photos

- Reorder the complete slide objects in `slides.js`. The route is calculated
  from the current array order; do not maintain a separate route sequence.
  Interstitial cards remain part of the show order. Use route metadata on an
  interstitial when a journey needs to arrive at or depart from that card's
  location.
- Use a relevant major city as each route anchor, preferring the capital when
  it fits the stop. Do not use individual photo coordinates. Verify each point
  lies on land in the intended country in `assets/world-map.svg`; for coastal
  cities, use a nearby in-city point if the mapped city center falls in water.
- Use one canonical coordinate for each country, city, or capital across all
  slides and routes that refer to it. Define a shared location in `slides.js`
  and reuse it instead of duplicating or varying coordinates for the same
  place.
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
- `H` hides or shows the slide number, fullscreen button, navigation arrows,
  keyboard hints, and project mark. Keep the current song and place visible.
  The animated route remains visible.
- Preserve visible error messages for missing photos, meaningful image alt text,
  and the reduced-motion preference for the flight animation.

## Running and checking changes

Open `index.html` directly in a browser; no server or installation is required.
There is currently no automated test runner. For changes to the presentation,
manually check photo loading and rotation, previous/next controls, the map
transition, fullscreen, photo-credit updates, and browser-console errors. Verify
credits remain visible when `H` hides controls. Keep the site usable offline.
