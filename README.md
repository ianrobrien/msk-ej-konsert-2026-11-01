# Concert Journey

A lightweight, offline-friendly slideshow for the concert. It uses plain HTML,
CSS, and JavaScript; there are no packages or network dependencies.

## Run it

Open `index.html` in a browser and use the Fullscreen button.

## Controls

- `Space` or `Right Arrow`: next song
- `Left Arrow`: previous song
- `F`: toggle fullscreen
- `H`: hide or show the slide number, fullscreen button, navigation arrows, and
  keyboard hints; the project title and current song/place stay visible
- The on-screen arrows are also clickable

## Songs, order, and photos

`slides.js` is the single source of truth for the show. Move a whole slide object
to change the order. The geographic point stays with its song, and the plane
route is recalculated from the new order automatically.

Each slide has three local photographs in `assets/photos`; replace a file or
edit its `photos` array to change an image. Photo credits and source links are in
`PHOTO_CREDITS.md`; the current photo's credit and source link also appear on
screen. Photos cycle every 60 seconds by default; change
`photoIntervalMs` in `slides.js` to adjust the interval.

The route map uses the public-domain [Natural Earth 1:110m land dataset](https://www.naturalearthdata.com/).
