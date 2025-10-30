// UI interactions: header shadow on scroll, mobile nav toggle
(function(){
  function onScrollHeader(){
    var h = document.querySelector('.nj-header');
    if (!h) return;
    if (window.scrollY > 4) h.classList.add('scrolled'); else h.classList.remove('scrolled');
  }
  function bindMenu(){
    var btn = document.getElementById('nj-menu-button');
    var menu = document.getElementById('nj-mobile-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function(){
      var open = menu.getAttribute('data-open') === 'true';
      menu.setAttribute('data-open', String(!open));
      btn.setAttribute('aria-expanded', String(!open));
    });
    // Close when clicking a link
    menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ menu.setAttribute('data-open','false'); btn.setAttribute('aria-expanded','false'); }); });
  }
  document.addEventListener('DOMContentLoaded', function(){
    onScrollHeader(); bindMenu();
  });
  window.addEventListener('scroll', onScrollHeader, { passive: true });
})();
