/*
  Theme toggle. Follows prefers-color-scheme until clicked, then remembers the choice.
  The saved theme is applied before first paint by the inline snippet in each page's <head>.
*/
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function current() { return root.getAttribute('data-theme') || (mq && mq.matches ? 'dark' : 'light'); }
  function label() {
    var next = current() === 'dark' ? 'light' : 'dark';
    btn.textContent = next;
    btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }

  label();
  if (mq && mq.addEventListener) mq.addEventListener('change', label);
  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('pv-theme', next); } catch (e) {}
    label();
  });
})();
