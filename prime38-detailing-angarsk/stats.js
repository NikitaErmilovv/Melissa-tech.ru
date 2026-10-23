(function () {
  var ratingEl = document.getElementById('stat-rating');
  var reviewsEl = document.getElementById('stat-reviews');
  if (!ratingEl && !reviewsEl) return;

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
      if (ratingEl) {
        var formatted = formatRating(data && data.rating);
        if (formatted) ratingEl.textContent = formatted;
      }
      if (reviewsEl && data && data.reviews != null) {
        var count = Number(data.reviews);
        if (isFinite(count) && count > 0) reviewsEl.textContent = String(Math.round(count));
      }
    })
    .catch(function () {});
})();
