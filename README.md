# Concert Journey

A lightweight, offline-friendly slideshow for the concert. It uses plain HTML,
CSS, and JavaScript; there are no packages or network dependencies.

## View the show

[Open the live presentation](https://www.ianrobrien.dev/msk-ej-konsert-2026-11-01/).

GitHub Pages publishes from the `main` branch root; no custom CI or build
workflow is required.

## Run it

Open `index.html` in a browser and use the Fullscreen button.

## Controls

- `Space` or `Right Arrow`: advance to the next card or song. Song changes
  begin a 60-second flight. During a flight, press again to cancel it and show
  the next country's photos; if you wait for arrival, press again to start them.
- `Left Arrow`: go back; during a flight, cancel it and show the previous
  country's photos.
- `F`: toggle fullscreen
- `H`: hide or show the slide number, fullscreen button, navigation arrows, and
  keyboard hints; the project title and current song/place stay visible
- The on-screen arrows are also clickable

The show starts with `Velkommen`, has a `Pause` card between Brazil and Denmark,
and ends with `Takk for musikken`. The first song starts directly from the
welcome card; photos do not start automatically after a flight.

## Songs, order, and photos

`slides.js` is the single source of truth for the show. Move a whole slide object
to change the order. Interstitial cards use `type: "interstitial"` and a
Norwegian `title`; song slides keep their geographic point and photos. The plane
route is recalculated from the ordered song slides automatically.

Each song slide has three local photographs in `assets/photos`; replace a file
or edit its `photos` array to change an image. Photo credits and source links are
in `PHOTO_CREDITS.md`; the current photo's credit and source link also appear on
screen. Photos cycle every 60 seconds by default; change `photoIntervalMs` in
`slides.js` to adjust the interval. Change `flightDurationMs` there to adjust
the route animation duration.

The vintage-style route map uses the public-domain
[Natural Earth 1:110m land dataset](https://www.naturalearthdata.com/). Its
1200x500 equirectangular viewBox is cropped at 60 degrees south and matches the
flight-route coordinates.
