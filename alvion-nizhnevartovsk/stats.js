(function () {
  var ratingEl = document.getElementById('stat-rating');
  if (!ratingEl) return;

  function formatRating(value) {
    var num = Number(value);
    if (!isFinite(num)) return null;
    return num.toFixed(1);
  }

  var dir = (location.pathname || "/").replace(/[^/]+$/, "");
  var ratingUrl = (location.hostname === "127.0.0.1" || location.hostname === "localhost")
    ? "/api/2gis-rating.json"
    : dir + "api/2gis-rating.json";
  fetch(ratingUrl)
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
