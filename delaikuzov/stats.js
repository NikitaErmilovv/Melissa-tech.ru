(function () {
  var ratingEl = document.getElementById('stat-rating');
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
      if (formatted) ratingEl.textContent = formatted;
    })
    .catch(function () {});
})();
