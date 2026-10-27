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
  const routeDots = document.getElementById("route-dots");
  const routeActive = document.getElementById("route-active");
  const routeOrigin = document.getElementById("route-origin");
  const routeDestination = document.getElementById("route-destination");
  const routeTrackSleepers = document.getElementById("route-track-sleepers");
  const routeTrackRails = document.getElementById("route-track-rails");
  const flightPlane = document.getElementById("flight-plane");
  const travelTrain = document.getElementById("travel-train");
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

      photoStatusElement.hidden = false;
      photoStatusElement.textContent = `Kunne ikke laste inn bildet: ${photo.src}`;
      console.error(`Could not load concert photo: ${photo.src}`);
    };

    nextLayer.alt = photo.alt || `${slide.place} — ${slide.song}`;
    nextLayer.style.objectPosition = photo.position || "center";
    nextLayer.src = photo.src;
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

    if (slide.photos.length > 1) {
      photoTimer = window.setInterval(() => {
        showPhoto((photoIndex + 1) % slide.photos.length);
      }, config.photoIntervalMs);
    }
  }

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

  function animateFlight(fromPoint, toPoint, flight, onComplete) {
    const start = project(fromPoint);
    const end = project(toPoint);
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const control = {
      x: (start.x + end.x) / 2,
      y: Math.max(24, (start.y + end.y) / 2 - Math.min(120, distance * 0.18)),
    };
    const pathData = `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;

    routeDots.setAttribute("d", pathData);
    routeActive.setAttribute("d", pathData);
    routeOrigin.setAttribute("cx", String(start.x));
    routeOrigin.setAttribute("cy", String(start.y));
    routeDestination.setAttribute("cx", String(end.x));
    routeDestination.setAttribute("cy", String(end.y));
    const pathLength = routeActive.getTotalLength();
    routeActive.style.strokeDasharray = String(pathLength);
    routeActive.style.strokeDashoffset = String(pathLength);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reducedMotion ? 1 : (config.flightDurationMs ?? 60_000);
    let startTime;

    function frame(timestamp) {
      if (activeFlight !== flight) return;

      if (startTime === undefined) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
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
        : flightPlane;
      const rotationOffset = flight.vehicle === "steam-train" ? 0 : 90;
      const scale = flight.vehicle === "steam-train" ? " scale(0.65)" : "";
      vehicle.setAttribute(
        "transform",
        `translate(${point.x} ${point.y}) rotate(${angle + rotationOffset})${scale}`,
      );

      if (progress < 1) {
        flight.frameId = window.requestAnimationFrame(frame);
      } else {
        flight.frameId = null;
        onComplete();
      }
    }

    flight.frameId = window.requestAnimationFrame(frame);
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
    if (!fromSlide.point || !toSlide.point) {
      console.error(
        "A song is missing its map point; showing it without a route.",
      );
      slideIndex = toIndex;
      renderSlide();
      return;
    }

    window.clearInterval(photoTimer);
    const vehicle = toSlide.incomingRoute?.from === fromSlide.id
      ? toSlide.incomingRoute.vehicle
      : "plane";
    const flight = { fromIndex, toIndex, frameId: null, vehicle };
    activeFlight = flight;
    isWaitingForPhotos = false;
    isTransitioning = true;
    travelOverlay.classList.toggle("is-train", vehicle === "steam-train");
    travelKickerElement.textContent = "PÅ REISE";
    travelCaptionElement.textContent =
      "Trykk høyre pil eller mellomrom for neste land, eller venstre pil for forrige.";
    travelRouteLabel.textContent =
      `${fromSlide.place}  \u2192  ${toSlide.place}`;
    travelOverlay.classList.add("is-active");
    travelOverlay.setAttribute("aria-hidden", "false");

    flight.frameId = window.requestAnimationFrame(() => {
      if (activeFlight !== flight) return;
      flight.frameId = null;
      animateFlight(fromSlide.point, toSlide.point, flight, () => {
        activeFlight = null;
        slideIndex = toIndex;
        lastFlightOriginIndex = fromIndex;
        isTransitioning = false;
        isWaitingForPhotos = true;
        travelKickerElement.textContent = "ANKOMMET";
        travelCaptionElement.textContent =
          `${toSlide.song} · Trykk høyre pil eller mellomrom for å vise bildene.`;
      });
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

    const previousIndex = Math.min(activeFlight.fromIndex, activeFlight.toIndex);
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
      } else if (lastFlightOriginIndex !== null) {
        startFlight(slideIndex, lastFlightOriginIndex);
      }
      return;
    }

    const nextIndex = slideIndex + direction;
    if (nextIndex < 0 || nextIndex >= config.slides.length) return;

    const currentSlide = config.slides[slideIndex];
    const nextSlide = config.slides[nextIndex];

    if (
      currentSlide.type === "interstitial" &&
      currentSlide.id === "pause" &&
      nextSlide.type !== "interstitial"
    ) {
      const originIndex = findSongIndex(slideIndex - direction, -direction);
      if (originIndex !== -1) {
        startFlight(originIndex, nextIndex);
        return;
      }
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
      moveSlide(-1);
    } else if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      toggleFullscreen();
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
