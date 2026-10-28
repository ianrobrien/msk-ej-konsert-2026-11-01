# World map options

These are five alternatives to consider for the flight map. None has been
confirmed to include both printed country names and a graticule; those can be
added when rendering geographic data.

1. **[Natural Earth 1:50m Admin-0 countries](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries/)** —
   [project data](https://github.com/nvkelso/natural-earth-vector/tree/master/50m_cultural).
   Country boundaries and name attributes can be rendered into a local SVG with
   labels and a graticule. Public domain. It shares the current map's Natural
   Earth source, but uses country boundaries at a finer scale than its 1:110m
   land data.
2. **[geoBoundaries](https://github.com/wmgeolab/geoBoundaries#file-access)** —
   [ADM0 download/API](https://www.geoboundaries.org/api/current/gbOpen/ALL/ADM0/).
   A separate source for global administrative boundaries; download and render
   the country polygons locally. Check the selected data's metadata for its
   license and attribution requirements.
3. **[Simple World Map](https://github.com/flekschas/simple-world-map)** —
   [SVG asset](https://raw.githubusercontent.com/flekschas/simple-world-map/d3c4ebb2d0b7fc90a89d2c1e8da0d579fea3871c/world-map.svg).
   Ready-made SVG with country borders and country-code paths, but no printed
   names or graticule. Licensed CC BY-SA 3.0. Its projection must be matched to
   the route before overlaying.
4. **[SVG World Map JS](https://github.com/raphaellepuschitz/SVG-World-Map)** —
   [world-states SVG](https://raw.githubusercontent.com/raphaellepuschitz/SVG-World-Map/c7d20284d66a62f3f549c48eab611bb3ca10ae09/src/world-states.svg).
   Ready-made SVG with country and state/province boundaries; no graticule or
   confirmed route projection. The project is MIT-licensed.
5. **[svgMap](https://github.com/stephanwagner/svgMap)** —
   [optimized SVG asset](https://raw.githubusercontent.com/stephanwagner/svgMap/b9b8b8cfce580f2c614832369e3346de37300e93/assets/map-optimized.svg).
   Country-boundary SVG with country-name data available through its library,
   rather than labels baked into this asset. The project is MIT-licensed; any
   scripts, styles, and assets needed for labels would need to be bundled for
   offline use.

The ready-made SVGs may need projection work before the route can align;
their path coordinates do not by themselves establish the geographic
projection. For the most accurate route and grid, render a geographic boundary
dataset, route, country labels, and latitude/longitude graticule together using
the same projection. Keep the resulting SVG local so the show remains offline.
