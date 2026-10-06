(function () {
  var NAV_OFFSET = 110;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function scrollToWorkAnchor() {
    var hash = window.location.hash;
    if (!hash || hash.indexOf("#work-") !== 0) return false;
    var target = document.querySelector(hash);
    if (!target) return false;
    var top = target.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
    window.scrollTo({ top: Math.max(0, top), left: 0, behavior: "auto" });
    return true;
  }

  function scheduleScroll() {
    var delays = [0, 50, 120, 300, 600, 1000];
    delays.forEach(function (ms) {
      window.setTimeout(scrollToWorkAnchor, ms);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleScroll);
  } else {
    scheduleScroll();
  }
  window.addEventListener("load", scheduleScroll);
  window.addEventListener("pageshow", scheduleScroll);
  window.addEventListener("hashchange", scheduleScroll);
})();
