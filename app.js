/* har-to-mocks site — no dependencies */
(function () {
  'use strict';

  /* Theme: dark by default, light on request, remembered per browser. */
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  function applyTheme(theme) {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    if (toggle) toggle.textContent = theme === 'light' ? 'Dark' : 'Light';
  }
  var saved = null;
  try { saved = localStorage.getItem('h2m-theme'); } catch (e) {}
  applyTheme(saved === 'light' ? 'light' : 'dark');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem('h2m-theme', next); } catch (e) {}
    });
  }

  /* Copy to clipboard. */
  var copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = copyBtn.getAttribute('data-copy') || '';
      var done = function () {
        copyBtn.textContent = 'Copied';
        setTimeout(function () { copyBtn.textContent = 'Click to copy'; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.position = 'absolute'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    });
  }

  /* Output-format tabs. */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      selectTab(next); next.focus();
    });
  });

  /* Live GitHub stars and forks; the static label stays if the API fails. */
  var stars = document.getElementById('gh-stars');
  if (stars && window.fetch) {
    fetch('https://api.github.com/repos/peterknezek/har-to-mocks')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (repo) {
        if (!repo || typeof repo.stargazers_count !== 'number') return;
        stars.textContent = '★ Star · ' + repo.stargazers_count + ' stars · ' + repo.forks_count + ' forks';
      })
      .catch(function () {});
  }

  /* Gallery position counters (tablet and mobile card galleries). */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  Array.prototype.forEach.call(document.querySelectorAll('[data-gallery]'), function (gal) {
    var key = gal.getAttribute('data-gallery');
    var out = document.querySelector('[data-pos="' + key + '"]');
    if (!out) return;
    var raf = 0;
    gal.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var kids = gal.children, origin = kids.length ? kids[0].offsetLeft : 0;
        var best = 1, dist = Infinity;
        for (var i = 0; i < kids.length; i++) {
          var d = Math.abs((kids[i].offsetLeft - origin) - gal.scrollLeft);
          if (d < dist) { dist = d; best = i + 1; }
        }
        out.textContent = pad(best);
      });
    }, { passive: true });
  });
})();
