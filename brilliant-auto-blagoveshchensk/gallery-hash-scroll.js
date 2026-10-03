(function () {
  var NAV_OFFSET = 96;

  function scrollToWorkAnchor() {
    var hash = window.location.hash;
    if (!hash || hash.indexOf("#work-") !== 0) return;
    var target = document.querySelector(hash);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
    window.scrollTo({ top: Math.max(0, top), left: 0, behavior: "auto" });
  }

  function scheduleScroll() {
    scrollToWorkAnchor();
    window.setTimeout(scrollToWorkAnchor, 80);
    window.setTimeout(scrollToWorkAnchor, 350);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleScroll);
  } else {
    scheduleScroll();
  }
  window.addEventListener("load", scheduleScroll);
  window.addEventListener("hashchange", scrollToWorkAnchor);
})();
