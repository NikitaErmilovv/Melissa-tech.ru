(function () {
  var meta = window.RIVER_HOME_SITE_REVIEWS && window.RIVER_HOME_SITE_REVIEWS.meta;
  var rating = meta && meta.rating != null ? String(meta.rating) : '4.9';
  var reviews = meta && meta.ratingsCount != null ? String(meta.ratingsCount) : '42';
  var ratingEl = document.getElementById('stat-rating');
  var reviewsEl = document.getElementById('stat-reviews');
  if (ratingEl) ratingEl.textContent = rating;
  if (reviewsEl) reviewsEl.textContent = reviews;
})();
