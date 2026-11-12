(function () {
  var ratingEl = document.getElementById("stat-rating");
  var ratingsCountEl = document.getElementById("stat-ratings-count");
  var reviewsCountEl = document.getElementById("stat-reviews-count");
  if (!ratingEl && !ratingsCountEl && !reviewsCountEl) return;

  function formatRating(value) {
    var num = Number(value);
    if (!isFinite(num)) return null;
    return num.toFixed(1);
  }

  fetch("data/2gis-meta.json?v=" + encodeURIComponent(Date.now()))
    .then(function (res) {
      if (!res.ok) throw new Error("meta unavailable");
      return res.json();
    })
    .then(function (data) {
      var formatted = formatRating(data && data.rating);
      if (formatted && ratingEl) ratingEl.textContent = formatted;
      if (data && data.ratingsCount != null && ratingsCountEl) {
        ratingsCountEl.textContent = String(data.ratingsCount);
      }
      if (data && data.reviewsCount != null && reviewsCountEl) {
        reviewsCountEl.textContent = String(data.reviewsCount);
      }
    })
    .catch(function () {});
})();
