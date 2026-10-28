(() => {
  const config = window.CONCERT_CONFIG;
  const stage = document.getElementById("stage");
  const keyHintElement = document.getElementById("key-hint");
  const placeElement = document.getElementById("place");
  const songElement = document.getElementById("song");
  const slideCountElement = document.getElementById("slide-count");
  const photoStatusElement = document.getElementById("photo-status");
  const photoCreditElement = document.getElementById("photo-credit");
  const photoCreditLabelElement = document.getElementById("photo-credit-label");
  const photoCreditSourceElement = document.getElementById("photo-credit-source");
  const travelOverlay = document.getElementById("travel-overlay");
  const travelKickerElement = document.getElementById("travel-kicker");
  const travelRouteLabel = document.getElementById("travel-route-label");
  const travelCaptionElement = document.getElementById("travel-caption");
  const mapFrame = document.querySelector(".map-frame");
  const mapCanvas = document.getElementById("map-art");
  const mapContext = mapCanvas.getContext("2d");
  const mapImage = new Image();
  const routeDots = document.getElementById("route-dots");
  const routeActive = document.getElementById("route-active");
  const routeOrigin = document.getElementById("route-origin");
  const routeDestination = document.getElementById("route-destination");
  const routeTrackSleepers = document.getElementById("route-track-sleepers");
  const routeTrackRails = document.getElementById("route-track-rails");
  const flightPlane = document.getElementById("flight-plane");
  const travelTrain = document.getElementById("travel-train");
  const travelBoat = document.getElementById("travel-boat");
  const photoLayers = [
    document.getElementById("photo-a"),
    document.getElementById("photo-b"),
  ];
  // Robinson projection scale factors at five-degree latitude intervals.
  const robinsonX = [
    1, 0.9986, 0.9954, 0.99, 0.9822, 0.973, 0.96, 0.9427, 0.9216,
    0.8962, 0.8679, 0.835, 0.7986, 0.7597, 0.7186, 0.6732, 0.6213,
    0.5722, 0.5322,
  ];
  const robinsonY = [
    0, 0.062, 0.124, 0.186, 0.248, 0.31, 0.372, 0.434, 0.4958, 0.5571,
    0.6176, 0.6769, 0.7346, 0.7903, 0.8435, 0.8936, 0.9394, 0.9761, 1,
  ];
  const mapProjection = {
    width: 1200,
    height: 600,
    northLatitude: 90,
    southLatitude: -60,
    xFactor: 0.8487,
    yFactor: 1.3523,
  };
  const globeRadius = 270;
  const mapGridStep = 10;

  function interpolateRobinson(values, latitude) {
    const position = Math.min(Math.abs(latitude) / 5, values.length - 1);
    const lower = Math.floor(position);
    const upper = Math.min(lower + 1, values.length - 1);
    const fraction = position - lower;

    return values[lower] + (values[upper] - values[lower]) * fraction;
  }

  const projectionScale = mapProjection.width /
    (2 * mapProjection.xFactor * Math.PI);
  const projectionTop = mapProjection.yFactor *
    interpolateRobinson(robinsonY, mapProjection.northLatitude);
  const projectionBottom =
    Math.sign(mapProjection.southLatitude) *
    mapProjection.yFactor *
    interpolateRobinson(robinsonY, mapProjection.southLatitude);
  const projectionTopMargin =
    (mapProjection.height -
      (projectionTop - projectionBottom) * projectionScale) /
    2;

  if (!config || !Array.isArray(config.slides) || config.slides.length === 0) {
    photoStatusElement.hidden = false;
    photoStatusElement.textContent = "Ingen sanger er konfigurert.";
    console.error("Concert slideshow has no configured songs.");
    return;
  }

  let slideIndex = 0;
  let photoIndex = 0;
  let visibleLayerIndex = 0;
  let imageLoadToken = 0;
  let photoTimer;
  let isTransitioning = false;
  let isWaitingForPhotos = false;
  let lastFlightOriginIndex = null;
  let activeFlight = null;
  let displayedRoute = null;
  let isFlatMap = false;
  let lastMapCenter = { latitude: 20, longitude: 0 };

  mapImage.onload = () => drawMap(lastMapCenter);
  mapImage.onerror = () => console.error("Could not load the local world map.");
  mapImage.src = "assets/world-map.svg";

  function renderPhotoCredit(photo) {
    photoCreditElement.hidden = false;
    photoCreditSourceElement.hidden = true;

    if (!photo.credit || !photo.license || !photo.source) {
      photoCreditLabelElement.textContent = "Fotokreditt mangler";
      console.error(`Incomplete photo attribution: ${photo.src}`);
      return;
    }

    const license =
      photo.license === "Public domain" ? "Verk i det fri" : photo.license;
    photoCreditLabelElement.textContent =
      `Foto: ${photo.credit} · ${license}`;
    photoCreditSourceElement.href = photo.source;
    photoCreditSourceElement.hidden = false;
  }

  function showPhoto(index) {
    const slide = config.slides[slideIndex];
    const photo = slide.photos[index];
    const nextLayerIndex = 1 - visibleLayerIndex;
    const nextLayer = photoLayers[nextLayerIndex];
    const token = ++imageLoadToken;

    nextLayer.onload = () => {
      if (token !== imageLoadToken) return;

      photoLayers[visibleLayerIndex].classList.remove("is-visible");
      nextLayer.classList.add("is-visible");
      visibleLayerIndex = nextLayerIndex;
      photoStatusElement.hidden = true;
      photoIndex = index;
      renderPhotoCredit(photo);
    };

    nextLayer.onerror = () => {
      if (token !== imageLoadToken) return;

      photoIndex = index;
      photoStatusElement.hidden = false;
      photoStatusElement.textContent = `Kunne ikke laste inn bildet: ${photo.src}`;
      console.error(`Could not load concert photo: ${photo.src}`);
    };

    nextLayer.alt = photo.alt || `${slide.place} — ${slide.song}`;
    nextLayer.style.objectPosition = photo.position || "center";
    nextLayer.src = photo.src;
  }

  function startPhotoTimer(slide) {
    if (slide.photos.length < 2) return;

    photoTimer = window.setInterval(() => {
      showPhoto((photoIndex + 1) % slide.photos.length);
    }, config.photoIntervalMs);
  }

  function hideTravelOverlay() {
    travelOverlay.classList.remove("is-active");
    travelOverlay.setAttribute("aria-hidden", "true");
  }

  function renderSlide() {
    window.clearInterval(photoTimer);
    imageLoadToken += 1;
    photoCreditElement.hidden = true;
    isWaitingForPhotos = false;
    hideTravelOverlay();

    const slide = config.slides[slideIndex];
    const slideNumber = String(slideIndex + 1).padStart(2, "0");
    const totalSlides = String(config.slides.length).padStart(2, "0");

    placeElement.textContent = slide.place || "";
    placeElement.hidden = !slide.place;
    songElement.textContent = slide.type === "interstitial"
      ? slide.title
      : slide.song;
    slideCountElement.textContent = `${slideNumber} / ${totalSlides}`;
    stage.classList.toggle("has-photos", slide.photos.length > 0);

    photoLayers.forEach((layer) => {
      layer.classList.remove("is-visible");
      layer.removeAttribute("src");
    });
    visibleLayerIndex = 0;
    photoIndex = 0;

    if (slide.type === "interstitial") {
      photoStatusElement.hidden = true;
      return;
    }

    if (slide.photos.length === 0) {
      photoStatusElement.hidden = false;
      photoStatusElement.textContent = "Bilder legges til her";
      return;
    }

    photoStatusElement.hidden = true;
    showPhoto(0);
    startPhotoTimer(slide);
  }

  function movePhoto(direction) {
    const slide = config.slides[slideIndex];
    if (
      isTransitioning ||
      isWaitingForPhotos ||
      slide.type === "interstitial" ||
      slide.photos.length < 2
    ) {
      return;
    }

    photoIndex = (photoIndex + direction + slide.photos.length) %
      slide.photos.length;
    window.clearInterval(photoTimer);
    showPhoto(photoIndex);
    startPhotoTimer(slide);
  }

  function projectRobinson(point) {
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

  function projectEquirectangular(point) {
    return {
      x: (point.longitude + 180) * mapProjection.width / 360,
      y: (mapProjection.northLatitude - point.latitude) *
        mapProjection.height /
        (mapProjection.northLatitude - mapProjection.southLatitude),
    };
  }

  function toVector(point) {
    const latitude = point.latitude * (Math.PI / 180);
    const longitude = point.longitude * (Math.PI / 180);
    const latitudeRadius = Math.cos(latitude);

    return {
      x: latitudeRadius * Math.cos(longitude),
      y: latitudeRadius * Math.sin(longitude),
      z: Math.sin(latitude),
    };
  }

  function normalizeVector(vector) {
    const length = Math.hypot(vector.x, vector.y, vector.z) || 1;

    return {
      x: vector.x / length,
      y: vector.y / length,
      z: vector.z / length,
    };
  }

  function pointFromVector(vector) {
    const normalized = normalizeVector(vector);

    return {
      latitude: Math.asin(normalized.z) * (180 / Math.PI),
      longitude: Math.atan2(normalized.y, normalized.x) * (180 / Math.PI),
    };
  }

  function routeMidpoint(fromPoint, toPoint) {
    const from = toVector(fromPoint);
    const to = toVector(toPoint);
    const midpoint = {
      x: from.x + to.x,
      y: from.y + to.y,
      z: from.z + to.z,
    };

    if (Math.hypot(midpoint.x, midpoint.y, midpoint.z) < 1e-6) {
      const axis = Math.abs(from.z) < 0.9
        ? { x: 0, y: 0, z: 1 }
        : { x: 1, y: 0, z: 0 };
      return pointFromVector({
        x: from.y * axis.z - from.z * axis.y,
        y: from.z * axis.x - from.x * axis.z,
        z: from.x * axis.y - from.y * axis.x,
      });
    }

    return pointFromVector(midpoint);
  }

  function projectOrthographic(point, center) {
    const latitude = point.latitude * (Math.PI / 180);
    const centerLatitude = center.latitude * (Math.PI / 180);
    const longitudeDifference =
      (point.longitude - center.longitude) * (Math.PI / 180);
    const sinLatitude = Math.sin(latitude);
    const cosLatitude = Math.cos(latitude);
    const sinCenterLatitude = Math.sin(centerLatitude);
    const cosCenterLatitude = Math.cos(centerLatitude);
    const cosLongitudeDifference = Math.cos(longitudeDifference);
    const visibility = sinCenterLatitude * sinLatitude +
      cosCenterLatitude * cosLatitude * cosLongitudeDifference;

    if (visibility < -1e-8) return null;

    return {
      x: mapProjection.width / 2 +
        globeRadius * cosLatitude * Math.sin(longitudeDifference),
      y: mapProjection.height / 2 - globeRadius * (
        cosCenterLatitude * sinLatitude -
        sinCenterLatitude * cosLatitude * cosLongitudeDifference
      ),
    };
  }

  function projectPoint(point, center) {
    return isFlatMap
      ? projectEquirectangular(point)
      : projectOrthographic(point, center);
  }

  function createMapVertex(longitude, latitude) {
    const point = { latitude, longitude };

    return {
      point,
      vector: toVector(point),
      source: projectRobinson(point),
    };
  }

  function visibilityOf(vector, centerVector) {
    return vector.x * centerVector.x +
      vector.y * centerVector.y +
      vector.z * centerVector.z;
  }

  function intersectHemisphere(start, end, startVisibility, endVisibility) {
    const fraction = startVisibility /
      (startVisibility - endVisibility);
    const vector = normalizeVector({
      x: start.vector.x + (end.vector.x - start.vector.x) * fraction,
      y: start.vector.y + (end.vector.y - start.vector.y) * fraction,
      z: start.vector.z + (end.vector.z - start.vector.z) * fraction,
    });
    const point = pointFromVector(vector);

    return {
      point,
      vector,
      source: projectRobinson(point),
    };
  }

  function clipTriangleToHemisphere(vertices, centerVector) {
    const clipped = [];

    for (let index = 0; index < vertices.length; index += 1) {
      const current = vertices[index];
      const previous = vertices[
        (index + vertices.length - 1) % vertices.length
      ];
      const currentVisibility = visibilityOf(current.vector, centerVector);
      const previousVisibility = visibilityOf(previous.vector, centerVector);
      const currentIsVisible = currentVisibility >= 0;
      const previousIsVisible = previousVisibility >= 0;

      if (currentIsVisible !== previousIsVisible) {
        clipped.push(intersectHemisphere(
          previous,
          current,
          previousVisibility,
          currentVisibility,
        ));
      }
      if (currentIsVisible) clipped.push(current);
    }

    return clipped;
  }

  function drawMapTriangle(vertices, center) {
    const source = vertices.map((vertex) => vertex.source);
    const target = vertices.map((vertex) => projectPoint(vertex.point, center));
    const [sourceStart, sourceNext, sourceLast] = source;
    const [targetStart, targetNext, targetLast] = target;
    const sourceWidth = sourceNext.x - sourceStart.x;
    const sourceHeight = sourceNext.y - sourceStart.y;
    const sourceDepth = sourceLast.x - sourceStart.x;
    const sourceLength = sourceLast.y - sourceStart.y;
    const determinant = sourceWidth * sourceLength -
      sourceDepth * sourceHeight;

    if (!targetStart || !targetNext || !targetLast ||
        Math.abs(determinant) < 1e-6) {
      return;
    }

    const targetWidth = targetNext.x - targetStart.x;
    const targetHeight = targetNext.y - targetStart.y;
    const targetDepth = targetLast.x - targetStart.x;
    const targetLength = targetLast.y - targetStart.y;
    const a = (targetWidth * sourceLength - targetDepth * sourceHeight) /
      determinant;
    const c = (targetDepth * sourceWidth - targetWidth * sourceDepth) /
      determinant;
    const b = (targetHeight * sourceLength - targetLength * sourceHeight) /
      determinant;
    const d = (targetLength * sourceWidth - targetHeight * sourceDepth) /
      determinant;
    const e = targetStart.x - a * sourceStart.x - c * sourceStart.y;
    const f = targetStart.y - b * sourceStart.x - d * sourceStart.y;
    const sourceLeft = Math.min(...source.map((point) => point.x));
    const sourceTop = Math.min(...source.map((point) => point.y));
    const sourceRight = Math.max(...source.map((point) => point.x));
    const sourceBottom = Math.max(...source.map((point) => point.y));
    const cropX = Math.max(0, sourceLeft);
    const cropY = Math.max(0, sourceTop);
    const cropWidth = Math.min(mapProjection.width, sourceRight) - cropX;
    const cropHeight = Math.min(mapProjection.height, sourceBottom) - cropY;

    if (cropWidth <= 0 || cropHeight <= 0) return;

    mapContext.save();
    mapContext.beginPath();
    mapContext.moveTo(targetStart.x, targetStart.y);
    mapContext.lineTo(targetNext.x, targetNext.y);
    mapContext.lineTo(targetLast.x, targetLast.y);
    mapContext.closePath();
    mapContext.clip();
    mapContext.transform(a, b, c, d, e, f);
    mapContext.drawImage(
      mapImage,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
    );
    mapContext.restore();
  }

  function traceProjectedLine(points, center) {
    let isDrawing = false;

    mapContext.beginPath();
    points.forEach((point) => {
      const projected = projectPoint(point, center);
      if (!projected) {
        isDrawing = false;
        return;
      }
      if (isDrawing) {
        mapContext.lineTo(projected.x, projected.y);
      } else {
        mapContext.moveTo(projected.x, projected.y);
        isDrawing = true;
      }
    });
    mapContext.stroke();
  }

  function drawGraticule(center) {
    mapContext.save();
    if (!isFlatMap) {
      mapContext.beginPath();
      mapContext.arc(
        mapProjection.width / 2,
        mapProjection.height / 2,
        globeRadius,
        0,
        Math.PI * 2,
      );
      mapContext.clip();
    }
    mapContext.strokeStyle = "rgba(92, 69, 49, 0.35)";
    mapContext.lineWidth = 1.5;

    if (isFlatMap) {
      for (let longitude = -180; longitude <= 180; longitude += 30) {
        traceProjectedLine(
          [-60, 90].map((latitude) => ({ latitude, longitude })),
          center,
        );
      }
      for (let latitude = -60; latitude <= 90; latitude += 15) {
        traceProjectedLine(
          [-180, 180].map((longitude) => ({ latitude, longitude })),
          center,
        );
      }
    } else {
      for (let longitude = -180; longitude < 180; longitude += 30) {
        const meridian = [];
        for (let latitude = -90; latitude <= 90; latitude += 3) {
          meridian.push({ latitude, longitude });
        }
        traceProjectedLine(meridian, center);
      }
      for (let latitude = -60; latitude <= 60; latitude += 30) {
        const parallel = [];
        for (let longitude = -180; longitude <= 180; longitude += 3) {
          parallel.push({ latitude, longitude });
        }
        traceProjectedLine(parallel, center);
      }
    }

    mapContext.restore();
  }

  function drawMap(center) {
    lastMapCenter = center || lastMapCenter;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const canvasWidth = mapProjection.width * pixelRatio;
    const canvasHeight = mapProjection.height * pixelRatio;

    if (mapCanvas.width !== canvasWidth) mapCanvas.width = canvasWidth;
    if (mapCanvas.height !== canvasHeight) mapCanvas.height = canvasHeight;
    mapContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    mapContext.clearRect(0, 0, mapProjection.width, mapProjection.height);
    mapContext.imageSmoothingEnabled = true;
    mapContext.imageSmoothingQuality = "high";

    if (isFlatMap) {
      mapContext.fillStyle = "#dfcfaa";
      mapContext.fillRect(0, 0, mapProjection.width, mapProjection.height);
    } else {
      mapContext.fillStyle = "#101817";
      mapContext.fillRect(0, 0, mapProjection.width, mapProjection.height);
      mapContext.beginPath();
      mapContext.arc(
        mapProjection.width / 2,
        mapProjection.height / 2,
        globeRadius,
        0,
        Math.PI * 2,
      );
      mapContext.fillStyle = "#dfcfaa";
      mapContext.fill();
    }

    if (mapImage.complete && mapImage.naturalWidth > 0) {
      const centerVector = isFlatMap ? null : toVector(lastMapCenter);
      const latitudeStart = mapProjection.southLatitude;

      if (!isFlatMap) {
        mapContext.save();
        mapContext.beginPath();
        mapContext.arc(
          mapProjection.width / 2,
          mapProjection.height / 2,
          globeRadius,
          0,
          Math.PI * 2,
        );
        mapContext.clip();
      }

      for (
        let latitude = latitudeStart;
        latitude < mapProjection.northLatitude;
        latitude += mapGridStep
      ) {
        const nextLatitude = Math.min(
          latitude + mapGridStep,
          mapProjection.northLatitude,
        );
        for (let longitude = -180; longitude < 180; longitude += mapGridStep) {
          const nextLongitude = longitude + mapGridStep;
          const corners = [
            createMapVertex(longitude, latitude),
            createMapVertex(nextLongitude, latitude),
            createMapVertex(nextLongitude, nextLatitude),
            createMapVertex(longitude, nextLatitude),
          ];
          const triangles = [[0, 1, 2], [0, 2, 3]];

          triangles.forEach((indices) => {
            const triangle = indices.map((index) => corners[index]);
            const visible = isFlatMap
              ? triangle
              : clipTriangleToHemisphere(triangle, centerVector);

            for (let index = 1; index < visible.length - 1; index += 1) {
              drawMapTriangle(
                [visible[0], visible[index], visible[index + 1]],
                lastMapCenter,
              );
            }
          });
        }
      }

      if (!isFlatMap) mapContext.restore();
    }

    drawGraticule(lastMapCenter);
    if (!isFlatMap) {
      mapContext.beginPath();
      mapContext.arc(
        mapProjection.width / 2,
        mapProjection.height / 2,
        globeRadius,
        0,
        Math.PI * 2,
      );
      mapContext.strokeStyle = "rgba(92, 69, 49, 0.7)";
      mapContext.lineWidth = 2;
      mapContext.stroke();
    }
  }

  function mapProjectionLabel() {
    return isFlatMap ? "FLATT KART" : "GLOBUS";
  }

  function drawRailway(pathLength, completedLength) {
    const progressLength = Math.min(completedLength, pathLength);

    function getFrame(distance) {
      const point = routeActive.getPointAtLength(distance);
      const before = routeActive.getPointAtLength(Math.max(0, distance - 1));
      const after = routeActive.getPointAtLength(
        Math.min(pathLength, distance + 1),
      );
      const directionX = after.x - before.x;
      const directionY = after.y - before.y;
      const directionLength = Math.hypot(directionX, directionY) || 1;

      return {
        point,
        normal: {
          x: -directionY / directionLength,
          y: directionX / directionLength,
        },
      };
    }

    function formatPoint(point) {
      return `${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    }

    const sampleCount = Math.max(1, Math.ceil(progressLength / 4));
    const rails = progressLength > 0
      ? [-3.5, 3.5].map((offset) => {
        const points = Array.from({ length: sampleCount + 1 }, (_, index) => {
          const distance = progressLength * index / sampleCount;
          const { point, normal } = getFrame(distance);

          return formatPoint({
            x: point.x + normal.x * offset,
            y: point.y + normal.y * offset,
          });
        });

        return `M ${points.join(" L ")}`;
      })
      : [];
    routeTrackRails.setAttribute("d", rails.join(" "));

    const sleeperDistances = [];
    for (let distance = 0; distance <= progressLength; distance += 12) {
      sleeperDistances.push(distance);
    }

    const sleepers = sleeperDistances.map((distance) => {
      const { point, normal } = getFrame(distance);
      const start = {
        x: point.x - normal.x * 8,
        y: point.y - normal.y * 8,
      };
      const end = {
        x: point.x + normal.x * 8,
        y: point.y + normal.y * 8,
      };

      return `M ${formatPoint(start)} L ${formatPoint(end)}`;
    });
    routeTrackSleepers.setAttribute("d", sleepers.join(" "));

    const remainingLength = pathLength - progressLength;
    if (remainingLength <= 0) {
      routeDots.setAttribute("d", "");
      return;
    }

    const futureSampleCount = Math.max(1, Math.ceil(remainingLength / 4));
    const futurePoints = Array.from(
      { length: futureSampleCount + 1 },
      (_, index) => {
        const distance = progressLength +
          remainingLength * index / futureSampleCount;
        return formatPoint(routeActive.getPointAtLength(distance));
      },
    );
    routeDots.setAttribute("d", `M ${futurePoints.join(" L ")}`);
  }

  function createRouteGeometry(route) {
    const start = projectPoint(route.fromPoint, route.mapCenter);
    const end = projectPoint(route.toPoint, route.mapCenter);
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const control = {
      x: (start.x + end.x) / 2,
      y: Math.max(24, (start.y + end.y) / 2 - Math.min(120, distance * 0.18)),
    };
    if (!isFlatMap) {
      const offsetX = control.x - mapProjection.width / 2;
      const offsetY = control.y - mapProjection.height / 2;
      const controlDistance = Math.hypot(offsetX, offsetY);
      const maxControlDistance = globeRadius - 28;
      if (controlDistance > maxControlDistance) {
        const scale = maxControlDistance / controlDistance;
        control.x = mapProjection.width / 2 + offsetX * scale;
        control.y = mapProjection.height / 2 + offsetY * scale;
      }
    }

    return {
      pathData: isFlatMap
        ? `M ${start.x} ${start.y} L ${end.x} ${end.y}`
        : `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
      start,
      end,
    };
  }

  function updateFlightProgress(flight, geometry, pathLength, progress) {
    const eased = 1 - (1 - progress) ** 3;
    const length = pathLength * eased;
    const point = routeActive.getPointAtLength(length);
    const beforePoint = routeActive.getPointAtLength(
      Math.max(0, length - 1),
    );
    const nextPoint = routeActive.getPointAtLength(
      Math.min(length + 1, pathLength),
    );
    const angle =
      Math.atan2(
        nextPoint.y - beforePoint.y,
        nextPoint.x - beforePoint.x,
      ) * (180 / Math.PI);

    if (flight.vehicle === "steam-train") {
      drawRailway(pathLength, length);
    }
    routeActive.style.strokeDashoffset = String(pathLength - length);
    const vehicle = flight.vehicle === "steam-train"
      ? travelTrain
      : flight.vehicle === "boat"
      ? travelBoat
      : flightPlane;
    const rotationOffset = flight.vehicle === "plane" ? 90 : 0;
    const scale = flight.vehicle === "steam-train"
      ? " scale(0.65)"
      : flight.vehicle === "boat"
      ? " scale(0.8)"
      : "";
    vehicle.setAttribute(
      "transform",
      `translate(${point.x} ${point.y}) rotate(${angle + rotationOffset})${scale}`,
    );
    flight.progress = progress;
  }

  function drawFlightRoute(route, progress) {
    const geometry = createRouteGeometry(route);
    routeDots.setAttribute("d", geometry.pathData);
    routeActive.setAttribute("d", geometry.pathData);
    routeOrigin.setAttribute("cx", String(geometry.start.x));
    routeOrigin.setAttribute("cy", String(geometry.start.y));
    routeDestination.setAttribute("cx", String(geometry.end.x));
    routeDestination.setAttribute("cy", String(geometry.end.y));
    const pathLength = routeActive.getTotalLength();
    routeActive.style.strokeDasharray = String(pathLength);
    updateFlightProgress(route, geometry, pathLength, progress);

    return { geometry, pathLength };
  }

  function animateFlight(flight, onComplete, initialProgress = 0) {
    const route = displayedRoute;
    const { geometry, pathLength } = drawFlightRoute(route, initialProgress);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reducedMotion ? 1 : (config.flightDurationMs ?? 60_000);
    let startTime;

    function frame(timestamp) {
      if (activeFlight !== flight) return;

      if (startTime === undefined) {
        startTime = timestamp - initialProgress * duration;
      }
      const progress = Math.min((timestamp - startTime) / duration, 1);
      updateFlightProgress(flight, geometry, pathLength, progress);

      if (progress < 1) {
        flight.frameId = window.requestAnimationFrame(frame);
      } else {
        flight.frameId = null;
        onComplete();
      }
    }

    flight.frameId = window.requestAnimationFrame(frame);
  }

  function toggleMapProjection() {
    isFlatMap = !isFlatMap;
    travelOverlay.classList.toggle("is-globe", !isFlatMap);
    mapFrame.classList.toggle("is-globe", !isFlatMap);
    drawMap(displayedRoute?.mapCenter ?? lastMapCenter);

    if (displayedRoute) {
      if (activeFlight) {
        if (activeFlight.frameId !== null) {
          window.cancelAnimationFrame(activeFlight.frameId);
        }
        activeFlight.frameId = null;
        animateFlight(
          activeFlight,
          activeFlight.onComplete,
          activeFlight.progress,
        );
      } else {
        drawFlightRoute(displayedRoute, 1);
      }
    }

    if (travelOverlay.classList.contains("is-active")) {
      const status = isWaitingForPhotos ? "ANKOMMET" : "PÅ REISE";
      travelKickerElement.textContent = `${status} · ${mapProjectionLabel()}`;
    }
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

  function startFlight(fromIndex, toIndex) {
    const fromSlide = config.slides[fromIndex];
    const toSlide = config.slides[toIndex];
    const fromLocation = fromSlide.routeOrigin ?? fromSlide;
    const toLocation = toSlide.routeOrigin ?? toSlide;
    if (!fromLocation.point || !toLocation.point) {
      console.error(
        "A route endpoint is missing its map point; showing the destination without a route.",
      );
      slideIndex = toIndex;
      renderSlide();
      return;
    }

    window.clearInterval(photoTimer);
    let vehicle = "plane";
    if (toSlide.incomingRoute?.from === fromSlide.id) {
      vehicle = toSlide.incomingRoute.vehicle;
    } else if (fromSlide.incomingRoute?.from === toSlide.id) {
      vehicle = fromSlide.incomingRoute.vehicle;
    }
    const mapCenter = routeMidpoint(fromLocation.point, toLocation.point);
    const flight = {
      fromIndex,
      toIndex,
      frameId: null,
      mapCenter,
      progress: 0,
      vehicle,
    };
    displayedRoute = {
      fromPoint: fromLocation.point,
      toPoint: toLocation.point,
      mapCenter,
      vehicle,
    };
    activeFlight = flight;
    isWaitingForPhotos = false;
    isTransitioning = true;
    travelOverlay.classList.toggle("is-train", vehicle === "steam-train");
    travelOverlay.classList.toggle("is-boat", vehicle === "boat");
    travelOverlay.classList.toggle("is-globe", !isFlatMap);
    mapFrame.classList.toggle("is-globe", !isFlatMap);
    travelKickerElement.textContent =
      `PÅ REISE · ${mapProjectionLabel()}`;
    travelCaptionElement.textContent =
      "Trykk høyre pil eller mellomrom for neste land, eller venstre pil for forrige. Trykk P for å bytte kartvisning.";
    travelRouteLabel.textContent =
      `${fromLocation.place}  \u2192  ${toLocation.place}`;
    travelOverlay.classList.add("is-active");
    travelOverlay.setAttribute("aria-hidden", "false");
    drawMap(mapCenter);

    flight.onComplete = () => {
      activeFlight = null;
      slideIndex = toIndex;
      lastFlightOriginIndex = fromIndex;
      isTransitioning = false;
      isWaitingForPhotos = true;
      travelKickerElement.textContent =
        `ANKOMMET · ${mapProjectionLabel()}`;
      const destinationName = toSlide.song ?? toSlide.title ??
        toLocation.place;
      const nextAction = toSlide.photos.length > 0
        ? "vise bildene"
        : "fortsette";
      travelCaptionElement.textContent =
        `${destinationName} · Trykk høyre pil eller mellomrom for å ${nextAction}. Trykk P for å bytte kartvisning.`;
    };

    flight.frameId = window.requestAnimationFrame(() => {
      if (activeFlight !== flight) return;
      flight.frameId = null;
      animateFlight(flight, flight.onComplete);
    });
  }

  function cancelFlightAndShowSlide(index) {
    if (!activeFlight) return;

    if (activeFlight.frameId !== null) {
      window.cancelAnimationFrame(activeFlight.frameId);
    }

    activeFlight = null;
    isTransitioning = false;
    lastFlightOriginIndex = null;
    slideIndex = index;
    renderSlide();
  }

  function cancelFlightToNextCountry() {
    if (!activeFlight) return;

    const nextIndex = Math.max(activeFlight.fromIndex, activeFlight.toIndex);
    cancelFlightAndShowSlide(nextIndex);
  }

  function cancelFlightToPreviousCountry() {
    if (!activeFlight) return;

    const destinationPreviousIndex = activeFlight.toIndex - 1;
    const destinationPreviousSlide = config.slides[destinationPreviousIndex];
    const previousIndex = activeFlight.toIndex > activeFlight.fromIndex &&
        destinationPreviousSlide?.type === "interstitial"
      ? destinationPreviousIndex
      : Math.min(activeFlight.fromIndex, activeFlight.toIndex);
    cancelFlightAndShowSlide(previousIndex);
  }

  function moveSlide(direction) {
    if (isTransitioning) {
      if (direction > 0) cancelFlightToNextCountry();
      else cancelFlightToPreviousCountry();
      return;
    }

    if (isWaitingForPhotos) {
      if (direction > 0) {
        renderSlide();
      } else {
        const currentSlide = config.slides[slideIndex];
        if (
          currentSlide.type === "interstitial" &&
          currentSlide.routeFromPreviousSong
        ) {
          const previousSongIndex = findSongIndex(
            slideIndex + direction,
            direction,
          );
          if (previousSongIndex !== -1) {
            startFlight(slideIndex, previousSongIndex);
          }
        } else {
          const previousIndex = slideIndex + direction;
          const previousSlide = config.slides[previousIndex];
          if (
            previousSlide?.type === "interstitial" &&
            !previousSlide.routeOrigin
          ) {
            slideIndex = previousIndex;
            renderSlide();
          } else if (lastFlightOriginIndex !== null) {
            startFlight(slideIndex, lastFlightOriginIndex);
          }
        }
      }
      return;
    }

    const nextIndex = slideIndex + direction;
    if (nextIndex < 0 || nextIndex >= config.slides.length) return;

    const currentSlide = config.slides[slideIndex];
    const nextSlide = config.slides[nextIndex];

    if (
      currentSlide.type === "interstitial" &&
      direction < 0 &&
      currentSlide.routeFromPreviousSong
    ) {
      const previousSongIndex = findSongIndex(
        slideIndex + direction,
        direction,
      );
      if (previousSongIndex !== -1) {
        startFlight(slideIndex, previousSongIndex);
        return;
      }
    } else if (
      currentSlide.type === "interstitial" &&
      direction > 0 &&
      nextSlide.type === "interstitial" &&
      nextSlide.routeFromPreviousSong
    ) {
      const originIndex = findSongIndex(slideIndex - direction, -direction);
      if (originIndex !== -1) {
        startFlight(originIndex, nextIndex);
        return;
      }
    } else if (
      currentSlide.type === "interstitial" &&
      direction > 0 &&
      currentSlide.routeToNextSong &&
      nextSlide.type !== "interstitial"
    ) {
      const originIndex = currentSlide.routeOrigin
        ? slideIndex
        : findSongIndex(slideIndex - direction, -direction);
      if (originIndex !== -1) {
        startFlight(originIndex, nextIndex);
        return;
      }
    } else if (
      currentSlide.type !== "interstitial" &&
      nextSlide.type === "interstitial" &&
      nextSlide.routeOrigin
    ) {
      startFlight(slideIndex, nextIndex);
      return;
    } else if (
      currentSlide.type !== "interstitial" &&
      nextSlide.type !== "interstitial"
    ) {
      startFlight(slideIndex, nextIndex);
      return;
    }

    slideIndex = nextIndex;
    renderSlide();
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await stage.requestFullscreen();
      }
    } catch (error) {
      photoStatusElement.hidden = false;
      photoStatusElement.textContent =
        "Fullskjerm er ikke tilgjengelig i denne nettleseren.";
      console.error("Could not toggle fullscreen mode.", error);
    }
  }

  document
    .getElementById("previous-button")
    .addEventListener("click", () => moveSlide(-1));
  document
    .getElementById("next-button")
    .addEventListener("click", () => moveSlide(1));
  document
    .getElementById("fullscreen-button")
    .addEventListener("click", toggleFullscreen);

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.code === "Space") {
      event.preventDefault();
      if (!event.repeat) moveSlide(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (!event.repeat) moveSlide(-1);
    } else if (event.key.toLowerCase() === "j") {
      event.preventDefault();
      if (!event.repeat) movePhoto(-1);
    } else if (event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (!event.repeat) movePhoto(1);
    } else if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      toggleFullscreen();
    } else if (event.key.toLowerCase() === "p") {
      event.preventDefault();
      if (!event.repeat) toggleMapProjection();
    } else if (event.key.toLowerCase() === "h") {
      event.preventDefault();
      if (!event.repeat) {
        const isUiHidden = stage.classList.toggle("is-ui-hidden");
        keyHintElement.hidden = isUiHidden;
      }
    }
  });

  renderSlide();
})();
