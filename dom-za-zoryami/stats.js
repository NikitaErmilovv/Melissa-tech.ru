(function () {
  var meta = window.ZORYAMI_SITE_REVIEWS && window.ZORYAMI_SITE_REVIEWS.meta;
  var rating = meta && meta.rating != null ? String(meta.rating) : "5";
  var reviews = meta && meta.ratingsCount != null ? String(meta.ratingsCount) : "58";
  var ratingEl = document.getElementById("stat-rating");
  var reviewsEl = document.getElementById("stat-reviews");
  if (ratingEl) ratingEl.textContent = rating;
  if (reviewsEl) reviewsEl.textContent = reviews;
})();