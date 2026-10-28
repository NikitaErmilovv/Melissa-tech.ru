(function () {
  var ratingEl = document.getElementById('stat-rating');
  var reviewsEl = document.getElementById('stat-reviews-count');
  var locRatingEl = document.getElementById('location-gis-rating');
  var locReviewsEl = document.getElementById('location-gis-count');

  var yandex = window.STUDIO_YANDEX_RATING || { rating: '4.4', count: '245' };
  ['stat-yandex-rating', 'location-yandex-rating'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el && yandex.rating) el.textContent = yandex.rating;
  });
  ['stat-yandex-count', 'location-yandex-count'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el && yandex.count) el.textContent = yandex.count;
  });

  if (!ratingEl) return;

  function formatRating(value) {
    var num = Number(value);
    if (!isFinite(num)) return null;
    return num.toFixed(1);
  }

  fetch('/api/2gis-rating.json')
    .then(function (res) {
      if (!res.ok) throw new Error('rating unavailable');
      return res.json();
    })
    .then(function (data) {
      var formatted = formatRating(data && data.rating);
      if (formatted) {
        ratingEl.textContent = formatted;
        if (locRatingEl) locRatingEl.textContent = formatted;
      }
      if (data && data.reviews != null) {
        var count = String(data.reviews);
        if (reviewsEl) reviewsEl.textContent = count;
        if (locReviewsEl) locReviewsEl.textContent = count;
      }
    })
    .catch(function () {});
})();
