/**
 * Эффект набора текста для манифеста (аналог TextType / GSAP-курсор через CSS).
 */
(function () {
  "use strict";

  var TEXT =
    "Хороший сайт — это не когда «нормально сверстано». Это когда у проекта появляется энергия, форма и ощущение, что он живой.";

  var typingSpeed = 75;
  var initialDelay = 400;
  var root = document.getElementById("manifesto-typewriter");
  if (!root) return;

  var contentEl = root.querySelector(".text-type__content");
  var cursorEl = root.querySelector(".text-type__cursor");
  if (!contentEl) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function showFull() {
    contentEl.textContent = TEXT;
    if (cursorEl) {
      cursorEl.style.display = "none";
    }
  }

  if (reduceMotion) {
    showFull();
    return;
  }

  var i = 0;
  var timer;

  function typeNext() {
    if (i >= TEXT.length) {
      return;
    }
    contentEl.textContent += TEXT.charAt(i);
    i += 1;
    timer = window.setTimeout(typeNext, typingSpeed);
  }

  function start() {
    contentEl.textContent = "";
    i = 0;
    window.clearTimeout(timer);
    window.setTimeout(typeNext, initialDelay);
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.disconnect();
        start();
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  io.observe(root);
})();
