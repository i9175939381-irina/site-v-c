/**
 * Stagger testimonials — порт с React: сдвиг массива, позиции, клик по карточке.
 */
(function () {
  "use strict";

  var SQRT_5000 = Math.sqrt(5000);

  var testimonials = [
    {
      id: 1,
      text:
        "Сайт получился живым — не шаблон, а характер. Заказчики сразу чувствуют уровень.",
      by: "Анна, эксперт по личному бренду",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=80",
    },
    {
      id: 2,
      text:
        "Собрали быстро, без бесконечных правок. Наконец-то понятный процесс и внятный результат.",
      by: "Михаил, основатель digital-студии",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80",
    },
    {
      id: 3,
      text: "Для меня важно, чтобы digital был вкусным. Здесь именно так.",
      by: "Елена, продюсер онлайн-курсов",
      img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80",
    },
    {
      id: 4,
      text:
        "И структура, и визуал на месте. Удобно и листать, и показывать на встречах.",
      by: "Дмитрий, IT-консультант",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&q=80",
    },
    {
      id: 5,
      text: "AI + ручная работа — увидела баланс. Рекомендую.",
      by: "Ольга, креативный директор",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&q=80",
    },
    {
      id: 6,
      text: "Долго искала «своё» оформление. Тут попали в точку.",
      by: "Ксения, автор медиапроекта",
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80",
    },
  ];

  var list = testimonials.slice();
  var cardsEl = document.getElementById("stagger-testimonials-cards");
  if (!cardsEl) return;

  function cardSize() {
    return window.matchMedia("(min-width: 640px)").matches ? 365 : 290;
  }

  function handleMove(steps) {
    if (steps === 0) return;
    var newList = list.slice();
    if (steps > 0) {
      for (var i = steps; i > 0; i--) {
        var item = newList.shift();
        if (!item) return;
        newList.push(Object.assign({}, item, { tempId: Math.random() }));
      }
    } else {
      for (var j = steps; j < 0; j++) {
        var last = newList.pop();
        if (!last) return;
        newList.unshift(Object.assign({}, last, { tempId: Math.random() }));
      }
    }
    list = newList;
    render();
  }

  function render() {
    var size = cardSize();
    var len = list.length;
    var odd = len % 2;
    var cardsHtml = "";

    list.forEach(function (item, index) {
      var position = odd
        ? index - (len + 1) / 2
        : index - len / 2;
      var isCenter = position === 0;
      var tx = (size / 1.5) * position;
      var ty = isCenter ? -65 : position % 2 ? 15 : -15;
      var rot = isCenter ? 0 : position % 2 ? 2.5 : -2.5;
      var clip =
        "polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)";

      var transform =
        "translate(-50%, -50%) translateX(" +
        tx +
        "px) translateY(" +
        ty +
        "px) rotate(" +
        rot +
        "deg)";

      var boxShadow = isCenter
        ? "0px 8px 0px 4px rgba(0, 242, 255, 0.18)"
        : "0px 0px 0px 0px transparent";

      var cls =
        "stagger-testimonials__card cursor-target" +
        (isCenter ? " stagger-testimonials__card--center" : "");

      cardsHtml +=
        '<article class="' +
        cls +
        '" role="button" tabindex="0" data-position="' +
        position +
        '" style="width:' +
        size +
        "px;height:" +
        size +
        "px;clip-path:" +
        clip +
        ";transform:" +
        transform +
        ";box-shadow:" +
        boxShadow +
        '">' +
        '<span class="stagger-testimonials__fold" aria-hidden="true" style="width:' +
        SQRT_5000 +
        'px"></span>' +
        '<img class="stagger-testimonials__avatar" src="' +
        item.img +
        '" alt="' +
        escapeHtml(item.by.split(",")[0].trim()) +
        '" width="48" height="56" loading="lazy" decoding="async" />' +
        '<p class="stagger-testimonials__quote">' +
        "«" +
        escapeHtml(item.text) +
        "»" +
        "</p>" +
        '<p class="stagger-testimonials__by">— ' +
        escapeHtml(item.by) +
        "</p>" +
        "</article>";
    });

    cardsEl.innerHTML = cardsHtml;

    cardsEl.querySelectorAll(".stagger-testimonials__card").forEach(function (card) {
      var pos = parseFloat(card.getAttribute("data-position")) || 0;
      card.addEventListener("click", function () {
        handleMove(pos);
      });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleMove(pos);
        }
      });
    });
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  var prevBtn = document.getElementById("stagger-prev");
  var nextBtn = document.getElementById("stagger-next");
  if (prevBtn) prevBtn.addEventListener("click", function () {
    handleMove(-1);
  });
  if (nextBtn) nextBtn.addEventListener("click", function () {
    handleMove(1);
  });

  window.addEventListener(
    "resize",
    function () {
      render();
    },
    { passive: true }
  );

  render();
})();
