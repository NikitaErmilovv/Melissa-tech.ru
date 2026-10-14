(function () {
  var ratingEl = document.getElementById('stat-rating');
  if (!ratingEl) return;

  function formatRating(value) {
    var num = Number(value);
    if (!isFinite(num)) return null;
    return num.toFixed(1);
  }

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      fetch('./cms/content.json?_=' + Date.now())
        .then(function (r) {
          return r.ok ? r.json() : {};
        })
        .then(function (store) {
          var text = (store['index.html'] && store['index.html'].text) || {};
          var key = ratingEl.dataset.cmsKey;
          if (key && Object.prototype.hasOwnProperty.call(text, key)) {
            /* CMS override for this stat — keep saved value */
            return null;
          }
          return fetch('/api/2gis-rating.json');
        })
        .then(function (res) {
          if (!res) return null;
          if (!res.ok) throw new Error('rating unavailable');
          return res.json();
        })
        .then(function (data) {
          if (!data) return;
          var formatted = formatRating(data.rating);
          if (formatted) ratingEl.textContent = formatted;
        })
        .catch(function () {});
    }, 700);
  });
})();
