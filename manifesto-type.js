/**
 * Манифест: набор текста по буквам (как раньше), части переключаются каруселью по клику «Читать манифест».
 */
(function () {
  "use strict";

  var PARTS = [
    "Хороший сайт — это не когда «нормально сверстано». Это когда у проекта появляется форма, энергия\nи ощущение, что он живой.",
    "Когда структура держит смысл,\nа визуал не мешает, а усиливает его.",
    "Когда ничего лишнего,\nи каждая деталь на своем месте.",
    "Я собираю проекты именно так —\nне как набор экранов,\nа как систему, в которой есть логика, вкус и движение.",
  ];

  var typingSpeed = 75;
  var initialDelay = 400;

  var root = document.getElementById("manifesto-typewriter");
  var btn = document.getElementById("manifesto-next");
  var live = document.getElementById("manifesto-live");
  if (!root) return;

  var contentEl = root.querySelector(".text-type__content");
  var cursorEl = root.querySelector(".text-type__cursor");
  if (!contentEl) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var currentIndex = 0;
  var charIndex = 0;
  var timer = null;
  var started = false;

  function clearTimer() {
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }
  }

  function showSlideFull(index) {
    contentEl.textContent = PARTS[index] || "";
    if (cursorEl) cursorEl.style.display = "none";
    if (live) live.textContent = PARTS[index];
  }

  function setAria() {
    if (!btn) return;
    if (!started) {
      btn.setAttribute("aria-label", "Читать манифест");
      return;
    }
    var next = (currentIndex + 1) % PARTS.length;
    btn.setAttribute(
      "aria-label",
      "Показать часть " + (next + 1) + " из " + PARTS.length + " манифеста"
    );
  }

  function typeNext() {
    var text = PARTS[currentIndex];
    if (!text) return;

    if (charIndex >= text.length) {
      if (cursorEl) cursorEl.style.display = "none";
      if (live) live.textContent = text;
      return;
    }

    contentEl.textContent += text.charAt(charIndex);
    charIndex += 1;
    if (cursorEl) cursorEl.style.display = "inline-block";
    timer = window.setTimeout(typeNext, typingSpeed);
  }

  function startTyping(index) {
    clearTimer();
    currentIndex = index;
    contentEl.textContent = "";
    charIndex = 0;
    if (cursorEl) cursorEl.style.display = "inline-block";
    if (live) live.textContent = "";

    timer = window.setTimeout(typeNext, initialDelay);
    setAria();
  }

  if (reduceMotion) {
    started = true;
    currentIndex = 0;
    showSlideFull(0);
    setAria();
    if (btn) {
      btn.addEventListener("click", function () {
        currentIndex = (currentIndex + 1) % PARTS.length;
        showSlideFull(currentIndex);
        setAria();
      });
    }
    return;
  }

  function beginFirstPart() {
    if (started) return;
    started = true;
    startTyping(0);
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.disconnect();
        beginFirstPart();
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  io.observe(root);

  if (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (!started) {
        beginFirstPart();
        return;
      }
      var next = (currentIndex + 1) % PARTS.length;
      startTyping(next);
    });
  }

  setAria();
})();
