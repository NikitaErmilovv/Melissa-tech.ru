(function () {
  var DEFAULTS = {
    cardWidth: 480,
    cardHeight: 620,
    radius: 18,
    tint: '#05060a',
    depth: 220,
    spread: 72,
    tilt: 22,
    tiltDirection: 'right',
    perspective: 1400,
    visibleCards: 3,
    falloff: 0.2,
    blur: 6,
    duration: 700,
    ease: 'power3.out',
    autoplay: false,
    autoplayDelay: 3200,
    loop: true,
    showControls: true,
    showIndicators: true
  };

  function num(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function readItems(root) {
    var node = root.querySelector('.depth-carousel__items');
    if (!node) return [];
    try {
      var data = JSON.parse(node.textContent || '[]');
      return data.map(function (item) {
        if (typeof item === 'string') return { image: item, alt: '' };
        return { image: item.image, alt: item.alt || '' };
      }).filter(function (item) { return item.image; });
    } catch (err) {
      return [];
    }
  }

  function DepthCarousel(root) {
    this.root = root;
    this.items = readItems(root);
    this.index = 0;
    this.timer = 0;
    this.drag = null;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.opts = {
      cardWidth: num(root.dataset.cardWidth, DEFAULTS.cardWidth),
      cardHeight: num(root.dataset.cardHeight, DEFAULTS.cardHeight),
      radius: num(root.dataset.radius, DEFAULTS.radius),
      tint: root.dataset.tint || DEFAULTS.tint,
      depth: num(root.dataset.depth, DEFAULTS.depth),
      spread: num(root.dataset.spread, DEFAULTS.spread),
      tilt: num(root.dataset.tilt, DEFAULTS.tilt),
      tiltDirection: root.dataset.tiltDirection === 'left' ? 'left' : 'right',
      perspective: num(root.dataset.perspective, DEFAULTS.perspective),
      visibleCards: num(root.dataset.visibleCards, DEFAULTS.visibleCards),
      falloff: num(root.dataset.falloff, DEFAULTS.falloff),
      blur: num(root.dataset.blur, DEFAULTS.blur),
      duration: num(root.dataset.duration, DEFAULTS.duration),
      ease: root.dataset.ease || DEFAULTS.ease,
      autoplay: root.dataset.autoplay === 'true',
      autoplayDelay: num(root.dataset.autoplayDelay, DEFAULTS.autoplayDelay),
      loop: root.dataset.loop !== 'false',
      showControls: root.dataset.showControls !== 'false',
      showIndicators: root.dataset.showIndicators !== 'false'
    };
    this.onChange = null;
    this.armed = false;
    this.build();
    this.bind();
    this.metrics();
  }

  DepthCarousel.prototype.build = function () {
    var opts = this.opts;
    this.root.classList.add('depth-carousel--ready');
    this.root.style.setProperty('--perspective', opts.perspective + 'px');
    this.root.style.setProperty('--radius', opts.radius + 'px');
    this.root.style.setProperty('--tint', opts.tint);

    var viewport = document.createElement('div');
    viewport.className = 'depth-carousel__viewport';
    viewport.tabIndex = 0;
    viewport.setAttribute('role', 'group');
    viewport.setAttribute('aria-roledescription', 'карусель');
    viewport.setAttribute('aria-label', this.root.dataset.label || 'Фото альбома');

    var stage = document.createElement('div');
    stage.className = 'depth-carousel__stage';
    viewport.appendChild(stage);

    this.cards = this.items.map(function (item, i) {
      var card = document.createElement('article');
      card.className = 'depth-card';
      var img = document.createElement('img');
      img.alt = item.alt || '';
      img.draggable = false;
      img.decoding = 'async';
      img.dataset.src = item.image;
      var shade = document.createElement('span');
      shade.className = 'depth-card__tint';
      card.appendChild(img);
      card.appendChild(shade);
      stage.appendChild(card);
      card.dataset.index = String(i);
      return card;
    });

    if (opts.showControls && this.items.length > 1) {
      this.prevBtn = this.button('Предыдущее фото', 'depth-carousel__arrow depth-carousel__arrow--prev', '‹');
      this.nextBtn = this.button('Следующее фото', 'depth-carousel__arrow depth-carousel__arrow--next', '›');
      this.root.appendChild(this.prevBtn);
      this.root.appendChild(this.nextBtn);
    }
    this.root.appendChild(viewport);
    this.viewport = viewport;
    this.stage = stage;

    if (opts.showIndicators && this.items.length > 1) {
      var dots = document.createElement('div');
      dots.className = 'depth-carousel__dots';
      this.dots = this.items.map(function (_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'depth-carousel__dot';
        dot.setAttribute('aria-label', 'Фото ' + (i + 1));
        dots.appendChild(dot);
        return dot;
      });
      this.root.appendChild(dots);
    }
  };

  DepthCarousel.prototype.button = function (label, className, text) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.setAttribute('aria-label', label);
    btn.textContent = text;
    return btn;
  };

  DepthCarousel.prototype.metrics = function () {
    var opts = this.opts;
    var available = Math.max(160, (this.viewport ? this.viewport.clientWidth : opts.cardWidth) - 4);
    var visible = Math.max(1, Math.min(opts.visibleCards, this.items.length || 1));
    var stackFactor = 1 + (opts.spread / opts.cardWidth) * (visible - 1);
    var cardWidth = available / stackFactor;
    cardWidth = Math.min(cardWidth, 560);
    var cardHeight = opts.cardHeight * (cardWidth / opts.cardWidth);
    var spread = opts.spread * (cardWidth / opts.cardWidth);
    var depth = opts.depth * (cardWidth / opts.cardWidth);
    this.root.style.setProperty('--card-w', cardWidth + 'px');
    this.root.style.setProperty('--card-h', cardHeight + 'px');
    return { cardWidth: cardWidth, spread: spread, depth: depth, visible: visible };
  };

  DepthCarousel.prototype.pose = function (offset, metrics) {
    var opts = this.opts;
    var dir = opts.tiltDirection === 'left' ? -1 : 1;
    var hidden = offset >= metrics.visible || offset < 0;
    var step = hidden ? metrics.visible : offset;
    var depthT = metrics.visible <= 1 ? 1 : step / (metrics.visible - 1);
    var fall = Math.min(1, step * opts.falloff * 2.2);
    return {
      x: dir * metrics.spread * step,
      z: -metrics.depth * step,
      rotateY: -dir * opts.tilt * step,
      opacity: hidden ? 0 : 1,
      blur: (this.reduced || hidden) ? 0 : opts.blur * depthT,
      tint: hidden ? 0.92 : Math.min(0.86, fall),
      zIndex: hidden ? 0 : 40 - step,
      hidden: hidden
    };
  };

  DepthCarousel.prototype.ensureLoaded = function (count) {
    var n = this.cards.length;
    var need = Math.min(count || 3, n);
    for (var step = 0; step < need; step++) {
      var img = this.cards[(this.index + step) % n].querySelector('img');
      if (!img.getAttribute('src') && img.dataset.src) img.src = img.dataset.src;
    }
  };

  DepthCarousel.prototype.layout = function (animate) {
    if (!this.armed || !window.gsap || !this.cards.length) return;
    this.ensureLoaded(Math.min(3, this.opts.visibleCards || 3));
    var metrics = this.metrics();
    var n = this.cards.length;
    var duration = (!animate || this.reduced) ? 0 : this.opts.duration / 1000;
    var self = this;
    this.stage.style.transformOrigin = this.opts.tiltDirection === 'left' ? 'right center' : 'left center';
    this.cards.forEach(function (card, i) {
      var offset = (i - self.index + n) % n;
      var pose = self.pose(offset, metrics);
      card.style.zIndex = String(pose.zIndex);
      card.style.pointerEvents = offset === 0 ? 'auto' : 'none';
      card.classList.toggle('is-active', offset === 0);
      card.setAttribute('aria-hidden', offset === 0 ? 'false' : 'true');
      if (self.opts.tiltDirection === 'left') {
        card.style.left = 'auto';
        card.style.right = '0px';
      } else {
        card.style.right = 'auto';
        card.style.left = '0px';
      }
      gsap.to(card, {
        x: pose.x,
        yPercent: -50,
        z: pose.z,
        rotateY: pose.rotateY,
        opacity: pose.opacity,
        filter: pose.blur < 0.15 ? 'none' : 'blur(' + pose.blur.toFixed(2) + 'px)',
        duration: duration,
        ease: self.opts.ease,
        overwrite: 'auto'
      });
      var shade = card.querySelector('.depth-card__tint');
      gsap.to(shade, { opacity: pose.tint, duration: duration, ease: self.opts.ease, overwrite: 'auto' });
    });
    if (this.dots) {
      this.dots.forEach(function (dot, i) {
        var on = i === self.index;
        dot.classList.toggle('is-active', on);
        dot.setAttribute('aria-current', on ? 'true' : 'false');
      });
    }
    this.placeArrows();
    if (typeof this.onChange === 'function') this.onChange(this.index, this.items[this.index]);
  };

  DepthCarousel.prototype.placeArrows = function () {
    if (!this.prevBtn || !this.nextBtn || !this.stage) return;
    var gap = 14;
    var arrowW = this.prevBtn.offsetWidth || 42;
    var cardW = parseFloat(this.root.style.getPropertyValue('--card-w')) || 0;
    if (!cardW) return;
    var originLeft = 0;
    var originTop = 0;
    var node = this.stage;
    while (node && node !== this.root) {
      originLeft += node.offsetLeft;
      originTop += node.offsetTop;
      node = node.offsetParent;
    }
    var cardLeft = this.opts.tiltDirection === 'left'
      ? originLeft + this.stage.clientWidth - cardW
      : originLeft;
    var maxLeft = Math.max(0, this.root.clientWidth - arrowW);
    var prevLeft = Math.max(0, Math.min(maxLeft, cardLeft - gap - arrowW));
    var nextLeft = Math.max(0, Math.min(maxLeft, cardLeft + cardW + gap));
    var mid = originTop + this.stage.clientHeight / 2;
    this.prevBtn.style.left = prevLeft + 'px';
    this.prevBtn.style.right = 'auto';
    this.prevBtn.style.top = mid + 'px';
    this.nextBtn.style.left = nextLeft + 'px';
    this.nextBtn.style.right = 'auto';
    this.nextBtn.style.top = mid + 'px';
  };

  DepthCarousel.prototype.go = function (next) {
    var n = this.items.length;
    if (n < 2) return;
    if (this.opts.loop) this.index = (next + n) % n;
    else this.index = Math.max(0, Math.min(n - 1, next));
    this.layout(true);
  };

  DepthCarousel.prototype.play = function () {
    var self = this;
    this.stop();
    this.timer = window.setInterval(function () { self.go(self.index + 1); }, this.opts.autoplayDelay);
  };

  DepthCarousel.prototype.stop = function () {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = 0;
  };

  DepthCarousel.prototype.bind = function () {
    var self = this;
    if (this.prevBtn) this.prevBtn.addEventListener('click', function () { self.go(self.index - 1); });
    if (this.nextBtn) this.nextBtn.addEventListener('click', function () { self.go(self.index + 1); });
    if (this.dots) {
      this.dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () { self.go(i); });
      });
    }
    this.viewport.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { event.preventDefault(); self.go(self.index + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); self.go(self.index - 1); }
    });
    this.viewport.addEventListener('pointerdown', function (event) {
      if (event.button !== 0) return;
      self.drag = { x: event.clientX, y: event.clientY, moved: false };
      self.stop();
    });
    window.addEventListener('pointermove', function (event) {
      if (!self.drag) return;
      if (Math.abs(event.clientX - self.drag.x) > 8) self.drag.moved = true;
    });
    window.addEventListener('pointerup', function (event) {
      if (!self.drag) return;
      var dx = event.clientX - self.drag.x;
      var moved = self.drag.moved;
      self.drag = null;
      if (Math.abs(dx) > 48) self.go(self.index + (dx < 0 ? 1 : -1));
      else if (!moved && self.root.dataset.href) {
        var card = event.target.closest ? event.target.closest('.depth-card.is-active') : null;
        if (card) window.location.href = self.root.dataset.href;
      }
      if (self.opts.autoplay && !self.reduced) self.play();
    });
    this.root.addEventListener('mouseenter', function () { self.stop(); });
    this.root.addEventListener('mouseleave', function () {
      if (self.opts.autoplay && !self.reduced && !self.root.contains(document.activeElement)) self.play();
    });
    this.root.addEventListener('focusin', function () { self.stop(); });
    this.root.addEventListener('focusout', function () {
      window.setTimeout(function () {
        if (self.opts.autoplay && !self.reduced && !self.root.contains(document.activeElement)) self.play();
      }, 0);
    });
    window.addEventListener('resize', function () {
      self.metrics();
      if (self.armed) self.layout(false);
    });
  };

  function whenNear(el, fn) {
    if (!('IntersectionObserver' in window)) {
      fn();
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
      obs.disconnect();
      fn();
    }, { rootMargin: '160px 0px' });
    obs.observe(el);
  }

  function boot() {
    if (!window.gsap) return;
    document.querySelectorAll('[data-depth-carousel]').forEach(function (root) {
      var carousel = new DepthCarousel(root);
      root.depthCarousel = carousel;
      whenNear(root, function () {
        carousel.armed = true;
        carousel.layout(false);
        if (carousel.opts.autoplay && !carousel.reduced && carousel.items.length > 1) carousel.play();
      });
    });
    document.querySelectorAll('section').forEach(function (section) {
      if (!section.querySelector('[data-bg]')) return;
      whenNear(section, function () {
        section.querySelectorAll('[data-bg]').forEach(function (el) {
          if (!el.dataset.bg || el.dataset.bgOn) return;
          el.dataset.bgOn = '1';
          el.style.backgroundImage = 'url("' + el.dataset.bg + '")';
        });
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
