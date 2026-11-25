(function () {
  var burger = document.querySelector('.nav-burger');
  var panel = document.querySelector('.nav-mobile-menu');
  if (!burger || !panel) return;
  function setOpen(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }
  burger.addEventListener('click', function () { setOpen(!panel.classList.contains('is-open')); });
  panel.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
})();

(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var root = document.documentElement;
  var target = window.scrollY;
  var current = window.scrollY;
  var running = false;
  var approach = 0.35;
  var frame = 0;

  function maxScroll() {
    return Math.max(0, root.scrollHeight - window.innerHeight);
  }

  function stop() {
    running = false;
    frame += 1;
    root.style.scrollBehavior = '';
  }

  function tick(id) {
    if (!running || id !== frame) return;
    current += (target - current) * approach;
    root.style.scrollBehavior = 'auto';
    if (Math.abs(target - current) < 0.5) {
      window.scrollTo(0, target);
      current = target;
      stop();
      return;
    }
    window.scrollTo(0, current);
    requestAnimationFrame(function () { tick(id); });
  }

  function editable(event) {
    var node = event.target;
    if (node && node.nodeType !== 1) node = node.parentElement;
    return !!(node && node.closest && node.closest('textarea, input, select, [contenteditable="true"]'));
  }

  function nestedScroll(event) {
    var node = event.target;
    if (node && node.nodeType !== 1) node = node.parentElement;
    while (node && node !== document.body) {
      var style = window.getComputedStyle(node);
      var oy = style.overflowY;
      if ((oy === 'auto' || oy === 'scroll') && node.scrollHeight > node.clientHeight + 2) return true;
      node = node.parentElement;
    }
    return false;
  }

  function nudge(delta, glide) {
    if (!delta) return;
    root.style.scrollBehavior = 'auto';
    if (!running) {
      current = window.scrollY;
      target = current;
      window.scrollTo(0, current);
    }
    approach = glide;
    target = Math.max(0, Math.min(maxScroll(), target + delta));
    if (!running) {
      running = true;
      frame += 1;
      var id = frame;
      root.style.scrollBehavior = 'auto';
      requestAnimationFrame(function () { tick(id); });
    }
  }

  window.addEventListener('wheel', function (event) {
    if (event.ctrlKey || event.metaKey) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (editable(event) || nestedScroll(event)) return;
    var delta = event.deltaY;
    if (event.deltaMode === 1) delta *= 16;
    else if (event.deltaMode === 2) delta *= window.innerHeight;
    if (!delta) return;
    event.preventDefault();
    var notch = Math.abs(delta) > 50;
    nudge(delta * (notch ? 0.74 : 0.9), notch ? 0.28 : 0.62);
  }, { passive: false });

  window.addEventListener('keydown', function (event) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return;
    if (editable(event)) return;
    var delta = 0;
    if (event.key === 'ArrowDown') delta = 42;
    else if (event.key === 'ArrowUp') delta = -42;
    else if (event.key === 'PageDown') delta = window.innerHeight * 0.72;
    else if (event.key === 'PageUp') delta = window.innerHeight * -0.72;
    else if (event.key === ' ') delta = window.innerHeight * (event.shiftKey ? -0.72 : 0.72);
    else return;
    var node = event.target;
    if (node && node.closest && node.closest('a, button, summary') && (event.key === ' ' || event.key === 'Enter')) return;
    event.preventDefault();
    nudge(delta, 0.28);
  });

  window.addEventListener('scroll', function () {
    if (running) return;
    current = window.scrollY;
    target = current;
  }, { passive: true });

  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest && event.target.closest('a[href^="#"]');
    if (!link) return;
    stop();
    current = window.scrollY;
    target = current;
  }, true);
})();

(function () {
  var parked = [];
  if (!('IntersectionObserver' in window)) return;

  function park(img) {
    var src = img.getAttribute('src');
    if (!src || img.dataset.src) return;
    img.dataset.src = src;
    img.removeAttribute('src');
    parked.push(img);
  }

  function show(img) {
    if (!img.getAttribute('src') && img.dataset.src) img.src = img.dataset.src;
  }

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      show(entry.target);
      obs.unobserve(entry.target);
    });
  }, { rootMargin: '200px 0px' });

  function hidden(img) {
    var style = window.getComputedStyle(img);
    return style.display === 'none' || style.visibility === 'hidden';
  }

  function near(img) {
    if (hidden(img)) return false;
    var rect = img.getBoundingClientRect();
    if (rect.height < 1 || rect.width < 1) return false;
    return rect.top < window.innerHeight + 200 && rect.bottom > -200;
  }

  function consider(img) {
    if (!img.dataset.src) {
      var src = img.getAttribute('src');
      if (!src) return;
      if (near(img)) return;
      img.dataset.src = src;
      img.removeAttribute('src');
    }
    parked.push(img);
    if (hidden(img)) return;
    if (near(img)) {
      show(img);
      return;
    }
    obs.observe(img);
  }

  document.querySelectorAll('img[loading="lazy"], img[data-src]').forEach(consider);

  function releaseParked() {
    parked.forEach(function (img) {
      if (img.getAttribute('src') || !img.dataset.src || hidden(img)) return;
      if (near(img)) show(img);
      else obs.observe(img);
    });
  }

  window.addEventListener('resize', releaseParked);
})();
