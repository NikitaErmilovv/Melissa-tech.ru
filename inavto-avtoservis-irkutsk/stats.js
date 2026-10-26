(function () {
  var ratingEl = document.getElementById('stat-rating');
  var reviewsEl = document.getElementById('stat-reviews');
  var reviewsFootEl = document.getElementById('stat-reviews-foot');
  if (ratingEl) ratingEl.textContent = '5.0';
  if (reviewsEl) reviewsEl.textContent = '8';
  if (reviewsFootEl) reviewsFootEl.textContent = '8';
})();
