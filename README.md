# Concert Journey

A lightweight, offline-friendly slideshow for the concert. It uses plain HTML,
CSS, and JavaScript; there are no packages or network dependencies.

## View the show

[Open the live presentation](https://www.ianrobrien.dev/mssk-ej-konsert-2026-11-01/).

GitHub Pages publishes from the `main` branch root; no custom CI or build
workflow is required.

## Run it

Open `index.html` in a browser and use the Fullscreen button.

## Controls

- `Space` or `Right Arrow`: advance to the next card or song. Song changes
  begin a 60-second flight. During a flight, press again to cancel it and show
  the next country's photos; if you wait for arrival, press again to start them.
- `Left Arrow`: go back; during a flight, cancel it to the previous card when
  an interstitial precedes the destination, otherwise show the previous
  country's photos.
- `F`: toggle fullscreen
- `H`: hide or show the slide number, fullscreen button, navigation arrows, and
  keyboard hints; the project title and current song/place stay visible
- Debugging only: `J` shows the previous photo and `K` the next; either resets
  the automatic photo timer.
- The on-screen arrows are also clickable

The show starts with `Velkommen`, followed by a flight from Norway to the first
song. After Brazil, the `Pause` card is followed by a flight back to Norway for
`Innslag med rekrutter/aspiranter`, then a flight from Norway to Denmark. The
show ends with `Takk for musikken`. Photos wait for a keypress after each flight.

## Songs, order, and photos

`slides.js` is the single source of truth for the show. Move a whole slide object
to change the order. Interstitial cards use `type: "interstitial"` and a
Norwegian `title`; song slides keep their geographic point and photos. Routes
between songs follow their order. Interstitial route locations can define where
a journey arrives or departs, and the welcome card's configured Norwegian
origin determines the opening flight.

Each song slide has three local photographs in `assets/photos`; replace a file
or edit its `photos` array to change an image. Photo credits and source links are
in `PHOTO_CREDITS.md`; the current photo's credit and source link also appear on
screen. Photos cycle every 60 seconds by default; change `photoIntervalMs` in
`slides.js` to adjust the interval. Change `flightDurationMs` there to adjust
the route animation duration.

The vintage-style route map uses public-domain
[Natural Earth 1:50m Admin-0 country data](https://www.naturalearthdata.com/)
for coastlines and country borders. Its graticule uses the same Robinson
projection as the flight routes. The 1200x600 viewBox covers 90 degrees north
to 90 degrees south, including Antarctica. Map data is bundled locally for
offline use.
