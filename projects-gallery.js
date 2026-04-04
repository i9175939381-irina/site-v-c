/**
 * Карусель превью в блоке «Избранные проекты» (два слайда в одном кадре 16:9).
 */
(function () {
  "use strict";

  document.querySelectorAll("[data-project-gallery]").forEach(function (gallery) {
    var track = gallery.querySelector("[data-gallery-track]");
    var prev = gallery.querySelector("[data-gallery-prev]");
    var next = gallery.querySelector("[data-gallery-next]");
    var counter = gallery.querySelector("[data-gallery-index]");
    var slides = gallery.querySelectorAll(".project-gallery__slide");
    var total = slides.length;

    if (!track || total === 0) return;

    var index = 0;
    var touchStartX = null;

    function apply() {
      var pct = (index / total) * 100;
      track.style.transform = "translateX(-" + pct + "%)";
      if (counter) counter.textContent = String(index + 1);
    }

    function go(delta) {
      index = (index + delta + total) % total;
      apply();
    }

    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });

    gallery.setAttribute("tabindex", "0");
    gallery.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    });

    gallery.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );

    gallery.addEventListener(
      "touchend",
      function (e) {
        if (touchStartX === null || !e.changedTouches.length) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(dx) < 48) return;
        if (dx < 0) go(1);
        else go(-1);
      },
      { passive: true }
    );

    apply();
  });
})();
