(function () {
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]');
    if (!b) return;
    var el = document.querySelector(b.dataset.copy);
    if (!el) return;
    var text = el.textContent.trim();
    navigator.clipboard.writeText(text).then(function () {
      var prev = b.textContent;
      b.textContent = 'Copied ✓';
      setTimeout(function () { b.textContent = prev; }, 1400);
    }).catch(function () {});
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });

  /* lightbox (vault page) */
  var lb = document.getElementById('lb');
  if (lb) {
    var lbimg = document.getElementById('lbimg'), lbcap = document.getElementById('lbcap');
    var items = Array.prototype.slice.call(document.querySelectorAll('.vm-btn[data-full]'));
    var cur = 0, lastFocus;
    function open(i) {
      if (!items.length) return;
      cur = (i + items.length) % items.length;
      var b = items[cur], img = b.querySelector('img');
      lbimg.src = b.dataset.full;
      lbimg.alt = img ? img.alt : '';
      lbcap.textContent = '#' + String(items.length - cur).padStart(2, '0') + ' · ' + (img ? img.alt : '');
      lb.hidden = false;
    }
    function close() { lb.hidden = true; if (lastFocus) lastFocus.focus(); }
    items.forEach(function (b, i) {
      b.addEventListener('click', function () { lastFocus = b; open(i); var x = lb.querySelector('.lb-x'); if (x) x.focus(); });
    });
    var bx = lb.querySelector('.lb-x'), bp = lb.querySelector('.lb-p'), bn = lb.querySelector('.lb-n');
    if (bx) bx.addEventListener('click', close);
    if (bp) bp.addEventListener('click', function () { open(cur - 1); });
    if (bn) bn.addEventListener('click', function () { open(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') open(cur - 1);
      if (e.key === 'ArrowRight') open(cur + 1);
    });
  }

  /* live DexScreener stats (Ethereum) */
  var CA = '0x6e147CDeBe396E3AdFC79db11178f972946d35E2';
  function fmt(n) {
    if (n == null || isNaN(n)) return '—';
    var a = Math.abs(n);
    if (a >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
    if (a >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
    return '$' + n.toFixed(0);
  }
  function loadStats() {
    var root = document.getElementById('stats');
    if (!root) return;
    fetch('https://api.dexscreener.com/latest/dex/tokens/' + CA)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var pairs = (data && data.pairs) || [];
        var eth = pairs.filter(function (p) { return (p.chainId || '').toLowerCase() === 'ethereum'; });
        var p = (eth[0] || pairs[0]);
        if (!p) return;
        var mcap = root.querySelector('[data-stat="mcap"]');
        var chg = root.querySelector('[data-stat="chg"]');
        var liq = root.querySelector('[data-stat="liq"]');
        if (mcap) mcap.textContent = fmt(Number(p.marketCap || p.fdv || 0));
        if (liq) liq.textContent = fmt(Number((p.liquidity && p.liquidity.usd) || 0));
        if (chg) {
          var c = Number((p.priceChange && p.priceChange.h24) || 0);
          chg.textContent = (c > 0 ? '+' : '') + c.toFixed(1) + '%';
          chg.style.color = c >= 0 ? '#7dffb3' : '#ff6b8a';
        }
      }).catch(function () {});
  }
  loadStats();

  /* soft spark particles */
  var c = document.getElementById('sparks');
  if (c && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var ctx = c.getContext('2d');
    var dpr = Math.min(devicePixelRatio || 1, 2);
    var dots = [];
    function resize() {
      c.width = innerWidth * dpr; c.height = innerHeight * dpr;
      c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn() {
      dots = [];
      for (var i = 0; i < 28; i++) {
        dots.push({
          x: Math.random() * innerWidth,
          y: Math.random() * innerHeight,
          r: 1 + Math.random() * 2.2,
          a: 0.15 + Math.random() * 0.45,
          v: 0.15 + Math.random() * 0.45,
          hue: Math.random() > 0.5 ? '255,106,26' : '255,61,154'
        });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      dots.forEach(function (d) {
        d.y -= d.v; if (d.y < -10) d.y = innerHeight + 10;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + d.hue + ',' + d.a + ')';
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    resize(); spawn(); tick();
    addEventListener('resize', function () { resize(); spawn(); });
  }
})();
