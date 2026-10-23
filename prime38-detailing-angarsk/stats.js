(function () {
  var ratingEl = document.getElementById('stat-rating');
  var reviewsEl = document.getElementById('stat-reviews');
  var reviewsFootEl = document.getElementById('stat-reviews-foot');
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
      if (data && data.reviews != null) {
        var count = Number(data.reviews);
        if (isFinite(count) && count > 0) {
          var countStr = String(Math.round(count));
          if (reviewsEl) reviewsEl.textContent = countStr;
          if (reviewsFootEl) reviewsFootEl.textContent = countStr;
        }
      }
    })
    .catch(function () {});
})();
