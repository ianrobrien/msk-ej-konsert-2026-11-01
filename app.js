(() => {
  const config = window.CONCERT_CONFIG;
  const stage = document.getElementById("stage");
  const placeElement = document.getElementById("place");
  const songElement = document.getElementById("song");
  const slideCountElement = document.getElementById("slide-count");
  const photoStatusElement = document.getElementById("photo-status");
  const photoCreditElement = document.getElementById("photo-credit");
  const photoCreditLabelElement = document.getElementById("photo-credit-label");
  const photoCreditSourceElement = document.getElementById("photo-credit-source");
  const travelOverlay = document.getElementById("travel-overlay");
  const travelRouteLabel = document.getElementById("travel-route-label");
  const routeDots = document.getElementById("route-dots");
  const routeActive = document.getElementById("route-active");
  const routeOrigin = document.getElementById("route-origin");
  const routeDestination = document.getElementById("route-destination");
  const flightPlane = document.getElementById("flight-plane");
  const photoLayers = [
    document.getElementById("photo-a"),
    document.getElementById("photo-b"),
  ];

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

  function renderSlide() {
    window.clearInterval(photoTimer);
    imageLoadToken += 1;
    photoCreditElement.hidden = true;

    const slide = config.slides[slideIndex];
    const slideNumber = String(slideIndex + 1).padStart(2, "0");
    const totalSlides = String(config.slides.length).padStart(2, "0");

    placeElement.textContent = slide.place;
    songElement.textContent = slide.song;
    slideCountElement.textContent = `${slideNumber} / ${totalSlides}`;
    stage.classList.toggle("has-photos", slide.photos.length > 0);

    photoLayers.forEach((layer) => {
      layer.classList.remove("is-visible");
      layer.removeAttribute("src");
    });
    visibleLayerIndex = 0;
    photoIndex = 0;

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
    return {
      x: ((point.longitude + 180) / 360) * 1200,
      y: ((90 - point.latitude) / 180) * 600,
    };
  }

  function animateFlight(fromPoint, toPoint, onComplete) {
    const start = project(fromPoint);
    const longitudeDelta =
      ((toPoint.longitude - fromPoint.longitude + 540) % 360) - 180;
    const end = {
      x: start.x + (longitudeDelta / 360) * 1200,
      y: project(toPoint).y,
    };
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
    const duration = reducedMotion ? 1 : 2400;
    let startTime;

    function frame(timestamp) {
      if (startTime === undefined) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const length = pathLength * eased;
      const point = routeActive.getPointAtLength(length);
      const nextPoint = routeActive.getPointAtLength(
        Math.min(length + 1, pathLength),
      );
      const angle =
        Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI) +
        90;

      routeActive.style.strokeDashoffset = String(pathLength - length);
      flightPlane.setAttribute(
        "transform",
        `translate(${point.x} ${point.y}) rotate(${angle})`,
      );

      if (progress < 1) {
        window.requestAnimationFrame(frame);
      } else {
        onComplete();
      }
    }

    window.requestAnimationFrame(frame);
  }

  function moveSlide(direction) {
    if (isTransitioning) return;

    const nextIndex = slideIndex + direction;
    if (nextIndex < 0 || nextIndex >= config.slides.length) return;

    const currentSlide = config.slides[slideIndex];
    const nextSlide = config.slides[nextIndex];
    if (!currentSlide.point || !nextSlide.point) {
      console.error("A slide is missing its map point; showing it without a route.");
      slideIndex = nextIndex;
      renderSlide();
      return;
    }

    window.clearInterval(photoTimer);
    isTransitioning = true;
    travelRouteLabel.textContent =
      `${currentSlide.place}  \u2192  ${nextSlide.place}`;
    travelOverlay.classList.add("is-active");
    travelOverlay.setAttribute("aria-hidden", "false");

    window.requestAnimationFrame(() => {
      animateFlight(currentSlide.point, nextSlide.point, () => {
        window.setTimeout(() => {
          slideIndex = nextIndex;
          renderSlide();
          travelOverlay.classList.remove("is-active");
          travelOverlay.setAttribute("aria-hidden", "true");
          window.setTimeout(() => {
            isTransitioning = false;
          }, 500);
        }, 200);
      });
    });
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
      moveSlide(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveSlide(-1);
    } else if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      toggleFullscreen();
    } else if (event.key.toLowerCase() === "h") {
      event.preventDefault();
      if (!event.repeat) stage.classList.toggle("is-ui-hidden");
    }
  });

  renderSlide();
})();
