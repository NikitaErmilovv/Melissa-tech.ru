(function () {
  var ratingEl = document.getElementById("stat-rating");
  var reviewsEl = document.getElementById("stat-reviews");
  function apply(meta) {
    if (!meta) return;
    if (ratingEl != null && meta.rating != null) ratingEl.textContent = String(meta.rating);
    if (reviewsEl != null && meta.review_count != null) reviewsEl.textContent = String(meta.review_count);
  }
  fetch("data/gis-meta.json", { cache: "no-store" })
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(apply)
    .catch(function () {});
})();