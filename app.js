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
  const videoSlide = document.getElementById("video-slide");
  const video = document.getElementById("slide-video");
  const videoPlayButton = document.getElementById("video-play-button");
  const videoSeek = document.getElementById("video-seek");
  const travelOverlay = document.getElementById("travel-overlay");
  const travelKickerElement = document.getElementById("travel-kicker");
  const travelRouteLabel = document.getElementById("travel-route-label");
  const travelCaptionElement = document.getElementById("travel-caption");
  const mapCameraElement = document.getElementById("map-camera");
  const routeDots = document.getElementById("route-dots");
  const routeActive = document.getElementById("route-active");
  const routeOrigin = document.getElementById("route-origin");
  const routeDestination = document.getElementById("route-destination");
  routeOrigin.removeAttribute("transform");
  routeDestination.removeAttribute("transform");
  const routeOriginRadius = Number(routeOrigin.getAttribute("r"));
  const routeDestinationRadius = Number(routeDestination.getAttribute("r"));
  const routeOriginStrokeWidth = Number.parseFloat(
    window.getComputedStyle(routeOrigin).strokeWidth,
  );
  const routeDestinationStrokeWidth = Number.parseFloat(
    window.getComputedStyle(routeDestination).strokeWidth,
  );
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
    southLatitude: -90,
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

  const projectionTop = mapProjection.yFactor *
    interpolateRobinson(robinsonY, mapProjection.northLatitude);
  const projectionBottom =
    Math.sign(mapProjection.southLatitude) *
    mapProjection.yFactor *
    interpolateRobinson(robinsonY, mapProjection.southLatitude);
  const projectionScale = Math.min(
    mapProjection.width / (2 * mapProjection.xFactor * Math.PI),
    mapProjection.height / (projectionTop - projectionBottom),
  );
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

      photoIndex = index;
      photoStatusElement.hidden = false;
      photoStatusElement.textContent = `Kunne ikke laste inn bildet: ${photo.src}`;
      console.error(`Could not load concert photo: ${photo.src}`);
    };

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

  function stopVideo() {
    video.pause();
    video.removeAttribute("src");
    video.load();
    videoSlide.hidden = true;
    stage.classList.remove("has-video");
  }

  function playVideo() {
    video.play().catch((error) => {
      if (error.name === "AbortError" || videoSlide.hidden || video.error) return;
      photoStatusElement.hidden = false;
      photoStatusElement.textContent = "Trykk «Spill av» for å starte videoen.";
    });
  }

  function renderSlide() {
    stage.classList.remove("is-traveling");
    stopVideo();
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

    if (slide.video) {
      stage.classList.add("has-video");
      videoSlide.hidden = false;
      video.setAttribute("aria-label", slide.title);
      videoSlide.setAttribute("aria-label", slide.title);
      videoSeek.value = "0";
      videoSeek.disabled = true;
      photoStatusElement.hidden = true;
      video.src = slide.video;
      playVideo();
      return;
    }

    if (slide.type === "interstitial" && slide.photos.length === 0) {
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

  function getMapCameraScale() {
    const transform = window.getComputedStyle(mapCameraElement).transform;
    return transform === "none"
      ? 1
      : new DOMMatrixReadOnly(transform).a;
  }

  function scaleMarker(marker, radius, strokeWidth, scale) {
    marker.setAttribute("r", String(radius * scale));
    marker.style.strokeWidth = `${strokeWidth * scale}px`;
  }

  function zoomMapToRoute(start, control, end) {
    const minX = Math.min(start.x, control.x, end.x);
    const maxX = Math.max(start.x, control.x, end.x);
    const minY = Math.min(start.y, control.y, end.y);
    const maxY = Math.max(start.y, control.y, end.y);
    const padding = 72;
    const scale = Math.max(
      1,
      Math.min(
        8,
        (mapProjection.width - padding * 2) / Math.max(maxX - minX, 1),
        (mapProjection.height - padding * 2) / Math.max(maxY - minY, 1),
      ),
    );

    if (scale === 1) {
      mapCameraElement.style.transform = "";
      return scale;
    }

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const translateX = 50 -
      (centerX / mapProjection.width) * scale * 100;
    const translateY = 50 -
      (centerY / mapProjection.height) * scale * 100;

    mapCameraElement.style.transform =
      `translate(${translateX}%, ${translateY}%) scale(${scale})`;
    return scale;
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

    if (progressLength >= pathLength) {
      routeDots.setAttribute("d", "");
    }
  }

  function animateFlight(fromPoint, toPoint, flight, onComplete) {
    const start = project(fromPoint);
    const end = project(toPoint);
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const control = {
      x: (start.x + end.x) / 2,
      y: Math.max(24, (start.y + end.y) / 2 - Math.min(120, distance * 0.18)),
    };
    const mapScale = zoomMapToRoute(start, control, end);
    let activeMapScale = mapScale;
    let isMapZooming = true;
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
      if (isMapZooming) {
        activeMapScale = getMapCameraScale();
        if (Math.abs(activeMapScale - mapScale) < 0.001) {
          activeMapScale = mapScale;
          isMapZooming = false;
        }
      }
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
      const needsReverseFacing =
        (flight.vehicle === "steam-train" || flight.vehicle === "boat") &&
        Math.abs(angle) > 90;
      const vehicleAngle = needsReverseFacing
        ? angle - Math.sign(angle) * 180
        : angle;
      const facingScale = needsReverseFacing ? " scale(-1 1)" : "";
      const rotationOffset = flight.vehicle === "plane" ? 90 : 0;
      const baseScale = flight.vehicle === "steam-train"
        ? 0.65
        : flight.vehicle === "boat"
        ? 0.8
        : 1;
      const scale = baseScale / Math.sqrt(activeMapScale);
      const markerScale = 1 / Math.sqrt(activeMapScale);
      scaleMarker(
        routeOrigin,
        routeOriginRadius,
        routeOriginStrokeWidth,
        markerScale,
      );
      scaleMarker(
        routeDestination,
        routeDestinationRadius,
        routeDestinationStrokeWidth,
        markerScale,
      );
      vehicle.setAttribute(
        "transform",
        `translate(${point.x} ${point.y}) rotate(${vehicleAngle + rotationOffset})${facingScale} scale(${scale})`,
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

    stage.classList.add("is-traveling");
    stopVideo();
    photoStatusElement.hidden = true;
    window.clearInterval(photoTimer);
    let vehicle = "plane";
    if (toSlide.incomingRoute?.from === fromSlide.id) {
      vehicle = toSlide.incomingRoute.vehicle;
    } else if (fromSlide.incomingRoute?.from === toSlide.id) {
      vehicle = fromSlide.incomingRoute.vehicle;
    }
    const flight = { fromIndex, toIndex, frameId: null, vehicle };
    activeFlight = flight;
    isWaitingForPhotos = false;
    isTransitioning = true;
    travelOverlay.classList.toggle("is-train", vehicle === "steam-train");
    travelOverlay.classList.toggle("is-boat", vehicle === "boat");
    travelKickerElement.textContent = "PÅ REISE";
    travelCaptionElement.textContent =
      "Trykk høyre pil eller mellomrom for neste land, eller venstre pil for forrige.";
    travelRouteLabel.textContent =
      `${fromLocation.place}  \u2192  ${toLocation.place}`;
    travelOverlay.classList.add("is-active");
    travelOverlay.setAttribute("aria-hidden", "false");

    flight.frameId = window.requestAnimationFrame(() => {
      if (activeFlight !== flight) return;
      flight.frameId = null;
      animateFlight(fromLocation.point, toLocation.point, flight, () => {
        activeFlight = null;
        slideIndex = toIndex;
        lastFlightOriginIndex = fromIndex;
        isTransitioning = false;
        isWaitingForPhotos = true;
        travelKickerElement.textContent = "ANKOMMET";
        const destinationName = toSlide.song ?? toSlide.title ??
          toLocation.place;
        const nextAction = toSlide.photos.length > 0
          ? "vise bildene"
          : "fortsette";
        travelCaptionElement.textContent =
          `${destinationName} · Trykk høyre pil eller mellomrom for å ${nextAction}.`;
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

  videoPlayButton.addEventListener("click", () => {
    if (video.paused) playVideo();
    else video.pause();
  });
  video.addEventListener("play", () => {
    videoPlayButton.textContent = "Pause";
    photoStatusElement.hidden = true;
  });
  video.addEventListener("pause", () => {
    videoPlayButton.textContent = "Spill av";
  });
  video.addEventListener("loadedmetadata", () => {
    videoSeek.disabled = !Number.isFinite(video.duration) || video.duration <= 0;
  });
  video.addEventListener("timeupdate", () => {
    if (!videoSeek.disabled) {
      videoSeek.value = String(video.currentTime / video.duration * 100);
    }
  });
  videoSeek.addEventListener("input", () => {
    if (!videoSeek.disabled) {
      video.currentTime = Number(videoSeek.value) / 100 * video.duration;
    }
  });
  video.addEventListener("error", () => {
    if (videoSlide.hidden) return;
    photoStatusElement.hidden = false;
    photoStatusElement.textContent =
      `Kunne ikke laste inn videoen: ${config.slides[slideIndex].video}. Trykk høyre pil for å fortsette.`;
  });

  stage.addEventListener("click", (event) => {
    if (event.target.closest("button, a, .video-slide")) return;

    const stageBounds = stage.getBoundingClientRect();
    moveSlide(event.clientX < stageBounds.left + stageBounds.width / 2 ? -1 : 1);
  });

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
