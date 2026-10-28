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
  const mapProjection = {
    width: 1200,
    height: 600,
    northLatitude: 90,
    southLatitude: -60,
  };
  const globeRadius = 270;

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
  const worldMapGroups = decodeMapData(window.CONCERT_MAP_DATA);

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

  function visibilityOf(vector, centerVector) {
    return vector.x * centerVector.x +
      vector.y * centerVector.y +
      vector.z * centerVector.z;
  }

  function intersectHemisphere(start, end, startVisibility, endVisibility) {
    const fraction = startVisibility / (startVisibility - endVisibility);
    const vector = normalizeVector({
      x: start.vector.x + (end.vector.x - start.vector.x) * fraction,
      y: start.vector.y + (end.vector.y - start.vector.y) * fraction,
      z: start.vector.z + (end.vector.z - start.vector.z) * fraction,
    });

    return {
      point: pointFromVector(vector),
      vector,
      isHorizon: true,
      entering: startVisibility < 0,
    };
  }

  function clipRingToHemisphere(vertices, centerVector) {
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

  function getRingWinding(ring) {
    let area = 0;
    for (let index = 0; index < ring.length; index += 1) {
      const current = ring[index].point;
      const next = ring[(index + 1) % ring.length].point;
      let longitudeDifference = next.longitude - current.longitude;
      if (longitudeDifference > 180) longitudeDifference -= 360;
      if (longitudeDifference < -180) longitudeDifference += 360;
      const nextLongitude = current.longitude + longitudeDifference;
      area += current.longitude * -next.latitude -
        nextLongitude * -current.latitude;
    }

    return Math.sign(area) || 1;
  }

  function drawHorizonArc(fromPoint, toPoint, direction) {
    const centerX = mapProjection.width / 2;
    const centerY = mapProjection.height / 2;
    const startAngle = Math.atan2(fromPoint.y - centerY, fromPoint.x - centerX);
    const endAngle = Math.atan2(toPoint.y - centerY, toPoint.x - centerX);
    let angleDifference = endAngle - startAngle;

    if (direction > 0) {
      while (angleDifference < 0) angleDifference += 2 * Math.PI;
    } else {
      while (angleDifference > 0) angleDifference -= 2 * Math.PI;
    }

    const stepCount = Math.max(1, Math.ceil(
      Math.abs(angleDifference) * globeRadius / 8,
    ));
    for (let step = 1; step <= stepCount; step += 1) {
      const angle = startAngle + angleDifference * step / stepCount;
      mapContext.lineTo(
        centerX + globeRadius * Math.cos(angle),
        centerY + globeRadius * Math.sin(angle),
      );
    }
  }

  function readMapVarint(bytes, offset) {
    let value = 0;
    let shift = 0;
    let byte;

    do {
      if (offset >= bytes.length || shift > 28) {
        throw new Error("Invalid bundled map data.");
      }
      byte = bytes[offset];
      offset += 1;
      value |= (byte & 0x7f) << shift;
      shift += 7;
    } while (byte & 0x80);

    return { value, offset };
  }

  function readMapSignedVarint(bytes, offset) {
    const result = readMapVarint(bytes, offset);

    return {
      value: (result.value >>> 1) ^ -(result.value & 1),
      offset: result.offset,
    };
  }

  function decodeMapData(encoded) {
    if (!encoded) return [];

    const bytes = Uint8Array.from(
      atob(encoded),
      (character) => character.charCodeAt(0),
    );
    const groups = [];
    let offset = 0;

    while (offset < bytes.length) {
      const groupResult = readMapVarint(bytes, offset);
      const group = [];
      offset = groupResult.offset;

      for (let ringIndex = 0; ringIndex < groupResult.value; ringIndex += 1) {
        const pointCountResult = readMapVarint(bytes, offset);
        const ring = [];
        let longitude = 0;
        let latitude = 0;
        offset = pointCountResult.offset;

        for (
          let pointIndex = 0;
          pointIndex < pointCountResult.value;
          pointIndex += 1
        ) {
          const longitudeResult = readMapSignedVarint(bytes, offset);
          const latitudeResult = readMapSignedVarint(
            bytes,
            longitudeResult.offset,
          );
          longitude += longitudeResult.value;
          latitude += latitudeResult.value;
          offset = latitudeResult.offset;
          const point = {
            latitude: latitude / 10,
            longitude: longitude / 10,
          };
          ring.push({ point, vector: toVector(point) });
        }
        group.push(ring);
      }
      groups.push(group);
    }

    return groups;
  }

  function drawLand(center) {
    const centerVector = isFlatMap ? null : toVector(center);

    mapContext.beginPath();
    worldMapGroups.forEach((group) => {
      group.forEach((ring) => {
        const vertices = isFlatMap
          ? ring
          : clipRingToHemisphere(ring, centerVector);
        if (vertices.length < 3) return;

        const firstPoint = projectPoint(vertices[0].point, center);
        if (!firstPoint) return;
        const winding = getRingWinding(ring);
        mapContext.moveTo(firstPoint.x, firstPoint.y);
        for (let index = 1; index < vertices.length; index += 1) {
          const previousVertex = vertices[index - 1];
          const currentVertex = vertices[index];
          const point = projectPoint(currentVertex.point, center);
          if (!point) continue;

          if (
            previousVertex.isHorizon &&
            !previousVertex.entering &&
            currentVertex.isHorizon &&
            currentVertex.entering
          ) {
            drawHorizonArc(
              projectPoint(previousVertex.point, center),
              point,
              winding,
            );
          } else {
            mapContext.lineTo(point.x, point.y);
          }
        }

        const lastVertex = vertices[vertices.length - 1];
        const firstVertex = vertices[0];
        if (
          lastVertex.isHorizon &&
          !lastVertex.entering &&
          firstVertex.isHorizon &&
          firstVertex.entering
        ) {
          drawHorizonArc(
            projectPoint(lastVertex.point, center),
            firstPoint,
            winding,
          );
        }
        mapContext.closePath();
      });
    });
    mapContext.fillStyle = "#c4b18a";
    mapContext.fill("evenodd");
    mapContext.strokeStyle = "rgba(117, 93, 63, 0.62)";
    mapContext.lineWidth = 1.15;
    mapContext.lineJoin = "round";
    mapContext.stroke();
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

    drawLand(lastMapCenter);
    drawGraticule(lastMapCenter);
    if (!isFlatMap) {
      mapContext.restore();
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
