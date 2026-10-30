const robinsonX = [
  1,
  0.9986,
  0.9954,
  0.99,
  0.9822,
  0.973,
  0.96,
  0.9427,
  0.9216,
  0.8962,
  0.8679,
  0.835,
  0.7986,
  0.7597,
  0.7186,
  0.6732,
  0.6213,
  0.5722,
  0.5322,
];
const robinsonY = [
  0,
  0.062,
  0.124,
  0.186,
  0.248,
  0.31,
  0.372,
  0.434,
  0.4958,
  0.5571,
  0.6176,
  0.6769,
  0.7346,
  0.7903,
  0.8435,
  0.8936,
  0.9394,
  0.9761,
  1,
];
const mapProjection = {
  width: 1200,
  height: 600,
  northLatitude: 90,
  southLatitude: -90,
  xFactor: 0.8487,
  yFactor: 1.3523,
};
const routeFillRatio = 0.72;
const maxRouteZoom = 18;
const frameAspectRatio = mapProjection.width / mapProjection.height;

Reflect.set(globalThis, "window", globalThis);
await import(new URL("../slides.js", import.meta.url));

const config = Reflect.get(globalThis, "CONCERT_CONFIG");
if (!config || !Array.isArray(config.slides) || config.slides.length === 0) {
  throw new Error("slides.js must define a non-empty CONCERT_CONFIG.slides.");
}
const slideIds = config.slides.map((slide) => slide.id);
if (
  slideIds.some((id) => typeof id !== "string" || id.length === 0) ||
  new Set(slideIds).size !== slideIds.length
) {
  throw new Error("Every configured slide must have a unique, non-empty id.");
}

const mapSource = await Deno.readTextFile(
  new URL("../assets/world-map.svg", import.meta.url),
);
const viewBoxAttribute = /(<svg\b[^>]*\bviewBox=")[^"]*(")/;
const sourceViewBox = mapSource.match(
  /<svg\b[^>]*\bviewBox="([^"]+)"/,
)?.[1].trim().split(/\s+/).map(Number);
if (
  !viewBoxAttribute.test(mapSource) ||
  sourceViewBox?.length !== 4 ||
  sourceViewBox.some((value, index) =>
    value !== [0, 0, mapProjection.width, mapProjection.height][index]
  )
) {
  throw new Error(
    "assets/world-map.svg must use the configured 1200x600 map projection.",
  );
}

function interpolateRobinson(values, latitude) {
  const position = Math.min(Math.abs(latitude) / 5, values.length - 1);
  const lower = Math.floor(position);
  const upper = Math.min(lower + 1, values.length - 1);
  const fraction = position - lower;

  return values[lower] + (values[upper] - values[lower]) * fraction;
}

const projectionTop = mapProjection.yFactor *
  interpolateRobinson(robinsonY, mapProjection.northLatitude);
const projectionBottom = Math.sign(mapProjection.southLatitude) *
  mapProjection.yFactor *
  interpolateRobinson(robinsonY, mapProjection.southLatitude);
const projectionScale = Math.min(
  mapProjection.width / (2 * mapProjection.xFactor * Math.PI),
  mapProjection.height / (projectionTop - projectionBottom),
);
const projectionTopMargin = (mapProjection.height -
  (projectionTop - projectionBottom) * projectionScale) /
  2;

function project(point) {
  const xScale = interpolateRobinson(robinsonX, point.latitude);
  const yScale = interpolateRobinson(robinsonY, point.latitude);
  const longitudeRadians = point.longitude * (Math.PI / 180);
  const projectedNorthing = Math.sign(point.latitude) *
    mapProjection.yFactor * yScale;

  return {
    x: mapProjection.width / 2 +
      mapProjection.xFactor * longitudeRadians * xScale * projectionScale,
    y: projectionTopMargin +
      (projectionTop - projectedNorthing) * projectionScale,
  };
}

function getQuadraticExtremum(start, control, end) {
  const denominator = start - 2 * control + end;
  if (denominator === 0) return null;

  const progress = (start - control) / denominator;
  if (progress <= 0 || progress >= 1) return null;

  const remaining = 1 - progress;
  return remaining ** 2 * start +
    2 * remaining * progress * control +
    progress ** 2 * end;
}

function getQuadraticBounds(start, control, end) {
  const xExtremum = getQuadraticExtremum(start.x, control.x, end.x);
  const yExtremum = getQuadraticExtremum(start.y, control.y, end.y);
  const minX = xExtremum === null
    ? Math.min(start.x, end.x)
    : Math.min(start.x, end.x, xExtremum);
  const maxX = xExtremum === null
    ? Math.max(start.x, end.x)
    : Math.max(start.x, end.x, xExtremum);
  const minY = yExtremum === null
    ? Math.min(start.y, end.y)
    : Math.min(start.y, end.y, yExtremum);
  const maxY = yExtremum === null
    ? Math.max(start.y, end.y)
    : Math.max(start.y, end.y, yExtremum);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function createRouteViewBox(fromPoint, toPoint) {
  const start = project(fromPoint);
  const end = project(toPoint);
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const control = {
    x: (start.x + end.x) / 2,
    y: Math.max(24, (start.y + end.y) / 2 - Math.min(120, distance * 0.18)),
  };
  const bounds = getQuadraticBounds(start, control, end);
  const desiredWidth = Math.max(
    mapProjection.width / maxRouteZoom,
    bounds.width / routeFillRatio,
    bounds.height * frameAspectRatio / routeFillRatio,
  );

  if (desiredWidth >= mapProjection.width) {
    return [0, 0, mapProjection.width, mapProjection.height];
  }

  const width = desiredWidth;
  const height = width / frameAspectRatio;
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;

  return [
    centerX - width / 2,
    centerY - height / 2,
    width,
    height,
  ].map((value) => Number(value.toFixed(3)));
}

function encodeFilenamePart(value) {
  return Array.from(new TextEncoder().encode(value), (byte) => {
    const character = String.fromCharCode(byte);
    return /^[A-Za-z0-9-]$/.test(character)
      ? character
      : `_x${byte.toString(16).padStart(2, "0")}_`;
  }).join("");
}

function findSongIndex(startIndex, direction) {
  for (
    let index = startIndex;
    index >= 0 && index < config.slides.length;
    index += direction
  ) {
    if (config.slides[index].type !== "interstitial") return index;
  }

  return -1;
}

const routePairs = new Map();
const routeFilenames = new Set();

function addRoute(fromIndex, toIndex) {
  const fromSlide = config.slides[fromIndex];
  const toSlide = config.slides[toIndex];
  if (!fromSlide || !toSlide) return;
  if (!fromSlide.id || !toSlide.id) {
    throw new Error("Every slide used by a route must have an id.");
  }

  const fromLocation = fromSlide.routeOrigin ?? fromSlide;
  const toLocation = toSlide.routeOrigin ?? toSlide;
  if (!fromLocation.point || !toLocation.point) return;
  for (const point of [fromLocation.point, toLocation.point]) {
    if (
      !Number.isFinite(point.latitude) ||
      !Number.isFinite(point.longitude)
    ) {
      throw new Error(
        `Route points for ${fromSlide.id} -> ${toSlide.id} must be numeric.`,
      );
    }
  }

  const pairKey = JSON.stringify(
    [fromSlide.id, toSlide.id].sort(),
  );
  if (routePairs.has(pairKey)) return;

  const filename = `${encodeFilenamePart(fromSlide.id)}_to_${
    encodeFilenamePart(toSlide.id)
  }.svg`;
  if (routeFilenames.has(filename)) {
    throw new Error(`Route map filename collision: ${filename}`);
  }
  routeFilenames.add(filename);

  routePairs.set(pairKey, {
    fromId: fromSlide.id,
    toId: toSlide.id,
    filename,
    viewBox: createRouteViewBox(
      fromLocation.point,
      toLocation.point,
    ),
  });
}

for (let index = 0; index < config.slides.length; index += 1) {
  const currentSlide = config.slides[index];

  for (const direction of [-1, 1]) {
    const nextIndex = index + direction;
    const nextSlide = config.slides[nextIndex];
    if (!nextSlide) continue;

    if (
      currentSlide.type === "interstitial" &&
      direction < 0 &&
      currentSlide.routeFromPreviousSong
    ) {
      const previousSongIndex = findSongIndex(nextIndex, direction);
      if (previousSongIndex !== -1) addRoute(index, previousSongIndex);
    } else if (
      currentSlide.type === "interstitial" &&
      direction > 0 &&
      nextSlide.type === "interstitial" &&
      nextSlide.routeFromPreviousSong
    ) {
      const originIndex = findSongIndex(index - direction, -direction);
      if (originIndex !== -1) addRoute(originIndex, nextIndex);
    } else if (
      currentSlide.type === "interstitial" &&
      direction > 0 &&
      currentSlide.routeToNextSong &&
      nextSlide.type !== "interstitial"
    ) {
      const originIndex = currentSlide.routeOrigin
        ? index
        : findSongIndex(index - direction, -direction);
      if (originIndex !== -1) addRoute(originIndex, nextIndex);
    } else if (
      currentSlide.type !== "interstitial" &&
      direction > 0 &&
      nextSlide.type === "interstitial" &&
      nextSlide.routeOrigin
    ) {
      addRoute(index, nextIndex);
    } else if (
      currentSlide.type !== "interstitial" &&
      nextSlide.type !== "interstitial"
    ) {
      addRoute(index, nextIndex);
    }
  }
}

if (routePairs.size === 0) {
  throw new Error("No configured route pairs were found in slides.js.");
}

const routeMapDirectory = new URL("../assets/route-maps/", import.meta.url);
await Deno.mkdir(routeMapDirectory, { recursive: true });

const generatedFilenames = new Set(
  Array.from(routePairs.values(), (route) => route.filename),
);
for await (const entry of Deno.readDir(routeMapDirectory)) {
  if (
    entry.isFile &&
    entry.name.endsWith(".svg") &&
    !generatedFilenames.has(entry.name)
  ) {
    await Deno.remove(new URL(entry.name, routeMapDirectory));
  }
}

const manifest = {};
for (const route of routePairs.values()) {
  const viewBox = route.viewBox.map((value) => value.toFixed(3)).join(" ");
  const routeSvg = mapSource
    .replace(
      viewBoxAttribute,
      (_match, prefix, suffix) => `${prefix}${viewBox}${suffix}`,
    )
    .replace(
      /\bstroke-width="([^"]+)"/g,
      (_match, width) =>
        `stroke-width="${
          (Number(width) * route.viewBox[2] / mapProjection.width).toFixed(5)
        }"`,
    );
  const src = `assets/route-maps/${route.filename}`;
  await Deno.writeTextFile(
    new URL(route.filename, routeMapDirectory),
    routeSvg,
  );

  const entry = { src, viewBox: route.viewBox };
  manifest[JSON.stringify([route.fromId, route.toId])] = entry;
  manifest[JSON.stringify([route.toId, route.fromId])] = entry;
}

const manifestSource = `window.CONCERT_ROUTE_MAPS = ${
  JSON.stringify(manifest, null, 2)
};\n`;
await Deno.writeTextFile(
  new URL("manifest.js", routeMapDirectory),
  manifestSource,
);

console.log(`Generated ${routePairs.size} route map SVGs.`);
