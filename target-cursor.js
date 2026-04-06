/**
 * TargetCursor — порт с React Bits на ванильный JS + GSAP (CDN).
 * Элементы с классом .cursor-target получают рамку из углов при наведении.
 */
(function () {
  "use strict";

  var targetSelector = ".cursor-target";
  var spinDuration = 2;
  var hideDefaultCursor = true;
  var hoverDuration = 0.2;
  var parallaxOn = true;

  var constants = { borderWidth: 3, cornerSize: 12 };

  function isMobile() {
    var hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    var small = window.innerWidth <= 768;
    var ua = (navigator.userAgent || navigator.vendor || "").toLowerCase();
    var mobileRe = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    return (hasTouch && small) || mobileRe.test(ua);
  }

  if (isMobile()) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  if (typeof gsap === "undefined") return;

  var cursor = document.getElementById("target-cursor");
  if (!cursor) return;

  var dot = cursor.querySelector(".target-cursor-dot");
  var corners = cursor.querySelectorAll(".target-cursor-corner");
  if (!dot || corners.length !== 4) return;

  var spinTl = null;
  var activeStrength = { current: 0 };
  var targetCornerPositions = null;
  var activeTarget = null;
  var currentLeaveHandler = null;
  var resumeTimeout = null;
  var tickerFn = null;

  var originalCursor = document.body.style.cursor;
  if (hideDefaultCursor) {
    document.body.style.cursor = "none";
  }

  gsap.set(cursor, {
    xPercent: -50,
    yPercent: -50,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  function moveCursor(x, y) {
    gsap.to(cursor, {
      x: x,
      y: y,
      duration: 0.1,
      ease: "power3.out",
    });
  }

  function createSpinTimeline() {
    if (spinTl) spinTl.kill();
    spinTl = gsap.timeline({ repeat: -1 }).to(cursor, {
      rotation: "+=360",
      duration: spinDuration,
      ease: "none",
    });
  }

  createSpinTimeline();

  function tickerFnImpl() {
    if (!targetCornerPositions || !corners.length) return;

    var strength = activeStrength.current;
    if (strength === 0) return;

    var cursorX = gsap.getProperty(cursor, "x");
    var cursorY = gsap.getProperty(cursor, "y");

    corners.forEach(function (corner, i) {
      var currentX = gsap.getProperty(corner, "x");
      var currentY = gsap.getProperty(corner, "y");
      var targetX = targetCornerPositions[i].x - cursorX;
      var targetY = targetCornerPositions[i].y - cursorY;
      var finalX = currentX + (targetX - currentX) * strength;
      var finalY = currentY + (targetY - currentY) * strength;
      var duration = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;

      gsap.to(corner, {
        x: finalX,
        y: finalY,
        duration: duration,
        ease: duration === 0 ? "none" : "power1.out",
        overwrite: "auto",
      });
    });
  }

  tickerFn = tickerFnImpl;

  function cleanupTarget(target) {
    if (currentLeaveHandler) {
      target.removeEventListener("mouseleave", currentLeaveHandler);
    }
    currentLeaveHandler = null;
  }

  function moveHandler(e) {
    moveCursor(e.clientX, e.clientY);
  }

  function scrollHandler() {
    if (!activeTarget) return;
    var mouseX = gsap.getProperty(cursor, "x");
    var mouseY = gsap.getProperty(cursor, "y");
    var el = document.elementFromPoint(mouseX, mouseY);
    var still =
      el &&
      (el === activeTarget || (el.closest && el.closest(targetSelector) === activeTarget));
    if (!still && currentLeaveHandler) {
      currentLeaveHandler();
    }
  }

  function mouseDownHandler() {
    if (dot) gsap.to(dot, { scale: 0.7, duration: 0.3 });
    gsap.to(cursor, { scale: 0.9, duration: 0.2 });
  }

  function mouseUpHandler() {
    if (dot) gsap.to(dot, { scale: 1, duration: 0.3 });
    gsap.to(cursor, { scale: 1, duration: 0.2 });
  }

  function enterHandler(e) {
    var directTarget = e.target;
    var allTargets = [];
    var current = directTarget;
    while (current && current !== document.body) {
      if (current.matches && current.matches(targetSelector)) {
        allTargets.push(current);
      }
      current = current.parentElement;
    }
    var target = allTargets[0] || null;
    if (!target) return;
    if (activeTarget === target) return;

    if (activeTarget) cleanupTarget(activeTarget);
    if (resumeTimeout) {
      clearTimeout(resumeTimeout);
      resumeTimeout = null;
    }

    activeTarget = target;
    corners.forEach(function (corner) {
      gsap.killTweensOf(corner);
    });

    gsap.killTweensOf(cursor, "rotation");
    if (spinTl) spinTl.pause();
    gsap.set(cursor, { rotation: 0 });

    var rect = target.getBoundingClientRect();
    var borderWidth = constants.borderWidth;
    var cornerSize = constants.cornerSize;
    var cursorX = gsap.getProperty(cursor, "x");
    var cursorY = gsap.getProperty(cursor, "y");

    targetCornerPositions = [
      { x: rect.left - borderWidth, y: rect.top - borderWidth },
      {
        x: rect.right + borderWidth - cornerSize,
        y: rect.top - borderWidth,
      },
      {
        x: rect.right + borderWidth - cornerSize,
        y: rect.bottom + borderWidth - cornerSize,
      },
      { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize },
    ];

    gsap.ticker.add(tickerFn);

    gsap.to(activeStrength, {
      current: 1,
      duration: hoverDuration,
      ease: "power2.out",
    });

    corners.forEach(function (corner, i) {
      gsap.to(corner, {
        x: targetCornerPositions[i].x - cursorX,
        y: targetCornerPositions[i].y - cursorY,
        duration: 0.2,
        ease: "power2.out",
      });
    });

    function leaveHandler() {
      gsap.ticker.remove(tickerFn);

      targetCornerPositions = null;
      gsap.set(activeStrength, { current: 0, overwrite: true });
      activeTarget = null;

      gsap.killTweensOf(corners);
      var cornerSize2 = constants.cornerSize;
      var positions = [
        { x: -cornerSize2 * 1.5, y: -cornerSize2 * 1.5 },
        { x: cornerSize2 * 0.5, y: -cornerSize2 * 1.5 },
        { x: cornerSize2 * 0.5, y: cornerSize2 * 0.5 },
        { x: -cornerSize2 * 1.5, y: cornerSize2 * 0.5 },
      ];
      var tl = gsap.timeline();
      corners.forEach(function (corner, index) {
        tl.to(
          corner,
          {
            x: positions[index].x,
            y: positions[index].y,
            duration: 0.3,
            ease: "power3.out",
          },
          0
        );
      });

      resumeTimeout = setTimeout(function () {
        if (!activeTarget && cursor) {
          createSpinTimeline();
        }
        resumeTimeout = null;
      }, 50);

      cleanupTarget(target);
    }

    currentLeaveHandler = leaveHandler;
    target.addEventListener("mouseleave", leaveHandler);
  }

  window.addEventListener("mousemove", moveHandler);
  window.addEventListener("mouseover", enterHandler, { passive: true });
  window.addEventListener("scroll", scrollHandler, { passive: true });
  window.addEventListener("mousedown", mouseDownHandler);
  window.addEventListener("mouseup", mouseUpHandler);

  /** Автоназначение целей: кнопки, ссылки шапки, карточки, бейджи и т.д. */
  document
    .querySelectorAll(
      [
        ".btn",
        ".site-header a",
        ".logo",
        ".card",
        ".project",
        ".badge",
        ".audience li",
        ".why__term",
        ".btn-text",
        ".contact-links a",
        ".contact-modal__close",
        ".contact-modal__panel",
        ".why__bridge-title",
        ".pitch__hook",
        ".pitch__finale",
        ".project-gallery__btn",
        ".project__thumb",
      ].join(", ")
    )
    .forEach(function (el) {
      el.classList.add("cursor-target");
    });
})();
