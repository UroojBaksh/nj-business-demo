/* GA4 Data Layer + User Context Initialization for NJ Business Portal Demo */
(function() {
  window.dataLayer = window.dataLayer || [];

  function uuid(prefix) {
    const ts = Date.now();
    const rnd = Math.random().toString(36).slice(2, 8);
    return prefix + '_' + ts + '_' + rnd;
  }

  // Persisted user/session context
  const storage = window.localStorage;
  const session = window.sessionStorage;

  if (!storage.getItem('user_id')) storage.setItem('user_id', uuid('usr'));
  if (!session.getItem('session_id')) session.setItem('session_id', uuid('sess'));
  if (!storage.getItem('registration_status')) storage.setItem('registration_status', 'not_started');
  if (!session.getItem('session_start')) session.setItem('session_start', String(Date.now()));

  // Defaults that can be updated progressively by forms
  const userContext = {
    user_id: storage.getItem('user_id'),
    session_id: session.getItem('session_id'),
    user_type: storage.getItem('has_returned') ? 'returning' : 'new',
    registration_status: storage.getItem('registration_status'),
    business_type: storage.getItem('business_type') || 'SoleProprietor',
    industry_category: storage.getItem('industry') || '',
    mwbe_status: {
      is_minority_owned: storage.getItem('mwbe_minority') === 'true',
      is_women_owned: storage.getItem('mwbe_women') === 'true',
      is_veteran_owned: storage.getItem('mwbe_veteran') === 'true',
      is_disabled_owned: storage.getItem('mwbe_disabled') === 'true'
    },
    geographic_region: storage.getItem('region') || 'North',
    county: storage.getItem('county') || '',
    preferred_language: storage.getItem('preferred_language') || 'en'
  };

  // Push user properties once per page
  window.dataLayer.push({
    event: 'set_user_properties',
    user_properties: userContext
  });

  // Utility: track generic event
  window.njTrack = function(eventName, payload) {
    window.dataLayer.push(Object.assign({ event: eventName, timestamp: new Date().toISOString() }, payload || {}));
  };

  // Resource download links
  function bindResourceDownloads() {
    document.querySelectorAll('a[data-resource]')?.forEach(a => {
      a.addEventListener('click', () => {
        window.njTrack('resource_download', {
          resource: {
            resource_name: a.getAttribute('data-resource-name') || a.textContent?.trim() || 'unknown',
            resource_type: a.getAttribute('data-resource-type') || 'file',
            resource_category: a.getAttribute('data-resource-category') || 'general'
          }
        });
      });
    });
  }

  // Help article read visibility (basic)
  function bindHelpArticles() {
    const articles = document.querySelectorAll('.help-article');
    if (!('IntersectionObserver' in window) || !articles.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          window.njTrack('help_article_read', {
            article: {
              article_id: entry.target.getAttribute('data-article-id') || 'unknown',
              time_spent: 0,
              helpfulness_rating: null
            }
          });
        }
      });
    }, { threshold: [0.5] });
    articles.forEach(el => observer.observe(el));
  }

  // Scroll depth sampling
  function bindScrollDepth() {
    let sent = {25:false,50:false,75:false,100:false};
    function handler() {
      const h = document.documentElement;
      const b = document.body;
      const depth = Math.round(((h.scrollTop||b.scrollTop) / ((h.scrollHeight||b.scrollHeight) - h.clientHeight)) * 100);
      [25,50,75,100].forEach(p => {
        if (!sent[p] && depth >= p) { sent[p] = true; window.njTrack('scroll_depth', { percentage: p }); }
      });
    }
    window.addEventListener('scroll', handler, { passive: true });
  }

  // Timer engagement every 15s
  function bindEngagementTimer() {
    setInterval(() => {
      const start = parseInt(session.getItem('session_start') || '0', 10);
      const secs = start ? Math.round((Date.now() - start) / 1000) : 0;
      window.njTrack('timer_engagement', { session_seconds: secs });
    }, 15000);
  }

  document.addEventListener('DOMContentLoaded', function() {
    storage.setItem('has_returned', 'true');
    bindResourceDownloads();
    bindHelpArticles();
    bindScrollDepth();
    bindEngagementTimer();
  });
})();
