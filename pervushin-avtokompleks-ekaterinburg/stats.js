(function () {
  var heroRatingEl = document.getElementById('stat-rating');
  var heroReviewsEl = document.getElementById('stat-reviews-count');
  var locRatingEl = document.getElementById('location-gis-rating');
  var locReviewsEl = document.getElementById('location-gis-count');

  var yandex = window.STUDIO_YANDEX_RATING || { rating: '4.4', count: '245' };

  if (heroRatingEl && yandex.rating) heroRatingEl.textContent = yandex.rating;
  if (heroReviewsEl && yandex.count) heroReviewsEl.textContent = yandex.count;

  var locYandexRatingEl = document.getElementById('location-yandex-rating');
  var locYandexCountEl = document.getElementById('location-yandex-count');
  if (locYandexRatingEl && yandex.rating) locYandexRatingEl.textContent = yandex.rating;
  if (locYandexCountEl && yandex.count) locYandexCountEl.textContent = yandex.count;

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
      if (formatted && locRatingEl) locRatingEl.textContent = formatted;
      if (data && data.reviews != null && locReviewsEl) {
        locReviewsEl.textContent = String(data.reviews);
      }
    })
    .catch(function () {});
})();
