(function () {
  document.querySelectorAll("[data-service-story]").forEach((root) => {
    const board = root.querySelector(".story-board");
    const cover = root.querySelector(".story-card--cover");
    const cards = [...root.querySelectorAll(".story-card")];
    if (!board || !cover || !cards.length) return;

    let unlocked = 0;
    cards[0].classList.add("is-lit");
    cards.forEach((card, index) => {
      if (index === 0 || card.querySelector(".story-step-label")) return;
      const label = document.createElement("span");
      label.className = "story-main-label story-step-label";
      label.textContent = "Шаг " + index;
      card.appendChild(label);
    });

    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;

    const maxLeft = () => cards[unlocked].offsetLeft;

    const fitsOnScreen = (card) => {
      const cardRect = card.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();
      return cardRect.right <= boardRect.right + 1;
    };

    const scrollCardIntoView = (card) => {
      const cardRect = card.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();
      board.scrollTo({
        left: board.scrollLeft + (cardRect.left - boardRect.left),
        behavior: "smooth",
      });
    };

    const unlockNext = () => {
      if (unlocked >= cards.length - 1) return;
      unlocked += 1;
      cover.setAttribute("aria-expanded", "true");
      cards[unlocked].classList.add("is-lit");
      if (fitsOnScreen(cards[unlocked])) return;
      board.classList.add("is-open");
      scrollCardIntoView(cards[unlocked]);
    };

    const tapCard = (card) => {
      if (!card) return;
      const index = cards.indexOf(card);
      if (index < 0) return;
      if (index === unlocked || index === unlocked + 1) {
        unlockNext();
        return;
      }
      if (index < unlocked) {
        board.classList.add("is-open");
        scrollCardIntoView(card);
      }
    };

    const snapToNearest = () => {
      const items = cards.filter((card, index) => index <= unlocked);
      if (!items.length) return;
      const left = board.scrollLeft;
      let best = items[0];
      let bestDist = Infinity;
      items.forEach((card) => {
        const dist = Math.abs(card.offsetLeft - left);
        if (dist < bestDist) {
          bestDist = dist;
          best = card;
        }
      });
      board.scrollTo({ left: best.offsetLeft, behavior: "smooth" });
    };

    board.addEventListener("pointerdown", (event) => {
      down = true;
      moved = false;
      startX = event.clientX;
      startLeft = board.scrollLeft;
    });

    board.addEventListener("pointermove", (event) => {
      if (!down) return;
      const dx = event.clientX - startX;
      if (Math.abs(dx) <= 4) return;
      if (!moved) {
        moved = true;
        board.classList.add("is-dragging");
        board.setPointerCapture(event.pointerId);
      }
      if (!board.classList.contains("is-open")) return;
      board.scrollLeft = Math.max(0, Math.min(maxLeft(), startLeft - dx));
    });

    const stop = (event) => {
      if (!down) return;
      down = false;
      board.classList.remove("is-dragging");
      if (moved) {
        snapToNearest();
        return;
      }
      const fromPoint = document.elementFromPoint(event.clientX, event.clientY);
      const card = event.target.closest(".story-card") || (fromPoint && fromPoint.closest(".story-card"));
      tapCard(card);
    };

    board.addEventListener("pointerup", stop);
    board.addEventListener("pointercancel", () => {
      down = false;
      moved = false;
      board.classList.remove("is-dragging");
    });
    board.addEventListener("click", (event) => {
      event.preventDefault();
    }, true);
  });
})();
