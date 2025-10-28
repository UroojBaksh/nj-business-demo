/* NJ Business Portal Demo: Unified Analytics Layer (GA4/GTM Friendly)
 - Stores user-scoped properties in sessionStorage
 - Attaches context to every dataLayer push
 - Emits session_start and derived metrics helpers
 - Cross-page utilities for forms, resources, scroll, video, help, chat
*/
(function() {
  // Bootstrap dataLayer
  window.dataLayer = window.dataLayer || [];

  // Storage helpers
  const ses = window.sessionStorage;
  const loc = window.localStorage; // used only to detect returning user

  function uuid(prefix){ return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }

  // Ensure identifiers
  if (!loc.getItem('persist_user_id')) loc.setItem('persist_user_id', uuid('usr'));
  if (!ses.getItem('user_id')) ses.setItem('user_id', loc.getItem('persist_user_id'));
  if (!ses.getItem('session_id')) ses.setItem('session_id', uuid('sess'));
  if (!ses.getItem('registration_status')) ses.setItem('registration_status', 'not_started');
  if (!ses.getItem('session_start')) ses.setItem('session_start', String(Date.now()));

  // Defaults (session-scoped per spec)
  const defaults = {
    user_id: ses.getItem('user_id'),
    session_id: ses.getItem('session_id'),
    user_type: loc.getItem('has_returned') ? 'returning' : 'new',
    registration_status: ses.getItem('registration_status') || 'not_started',
    business_type: ses.getItem('business_type') || 'SoleProprietor',
    industry_category: ses.getItem('industry_category') || '',
    mwbe_status: {
      is_minority_owned: ses.getItem('mwbe_minority') === 'true',
      is_women_owned: ses.getItem('mwbe_women') === 'true',
      is_veteran_owned: ses.getItem('mwbe_veteran') === 'true',
      is_disabled_owned: ses.getItem('mwbe_disabled') === 'true'
    },
    geographic_region: (ses.getItem('geographic_region') || 'North'),
    county: ses.getItem('county') || '',
    preferred_language: ses.getItem('preferred_language') || 'en'
  };

  // Derived/session helpers
  function sessionSeconds(){ const s = parseInt(ses.getItem('session_start')||'0',10); return s? Math.round((Date.now()-s)/1000):0; }
  function sessionDurationCategory(){ const t=sessionSeconds(); return t<60? 'short' : t<300? 'medium' : 'long'; }

  // Maintain lightweight interaction score
  function getIQ(){ return parseInt(ses.getItem('iq_score')||'0',10); }
  function bumpIQ(delta){ const v = Math.max(0, getIQ()+delta); ses.setItem('iq_score', String(v)); return v; }

  // Compute content engagement depth from latest scroll_depth event
  function getEngagementDepth(){ return parseInt(ses.getItem('content_depth')||'0',10); }

  function getUserProps(){
    // refresh from session each push to reflect latest changes
    return {
      user_id: ses.getItem('user_id'),
      session_id: ses.getItem('session_id'),
      user_type: loc.getItem('has_returned') ? 'returning' : 'new',
      registration_status: ses.getItem('registration_status') || 'not_started',
      business_type: ses.getItem('business_type') || 'SoleProprietor',
      industry_category: ses.getItem('industry_category') || '',
      mwbe_status: {
        is_minority_owned: ses.getItem('mwbe_minority') === 'true',
        is_women_owned: ses.getItem('mwbe_women') === 'true',
        is_veteran_owned: ses.getItem('mwbe_veteran') === 'true',
        is_disabled_owned: ses.getItem('mwbe_disabled') === 'true'
      },
      geographic_region: ses.getItem('geographic_region') || 'North',
      county: ses.getItem('county') || '',
      preferred_language: ses.getItem('preferred_language') || 'en'
    };
  }

  // Patch dataLayer.push to always include user properties + derived params for custom dimensions
  const originalPush = window.dataLayer.push.bind(window.dataLayer);
  window.dataLayer.push = function(obj){
    try {
      if (obj && typeof obj === 'object' && (obj.event || obj.ecommerce || obj.user_properties)) {
        // Attach user props and IDs
        obj.user_properties = Object.assign({}, getUserProps(), obj.user_properties||{});
        obj.user_id = obj.user_properties.user_id;
        obj.session_id = obj.user_properties.session_id;
        // Derived dims
        obj.session_duration_category = sessionDurationCategory();
        obj.interaction_quality_score = getIQ();
        obj.content_engagement_depth = getEngagementDepth();
        // Map for GA4 custom dimensions (event-scoped)
        obj.business_entity_type = obj.user_properties.business_type;
        obj.industry_vertical = obj.user_properties.industry_category;
        obj.mwbe_certification_status = [
          obj.user_properties.mwbe_status.is_minority_owned? 'minority': null,
          obj.user_properties.mwbe_status.is_women_owned? 'women': null,
          obj.user_properties.mwbe_status.is_veteran_owned? 'veteran': null,
          obj.user_properties.mwbe_status.is_disabled_owned? 'disabled': null
        ].filter(Boolean).join('|') || 'none';
        obj.geographic_region = obj.user_properties.geographic_region;
      }
    } catch(e) { /* silent */ }
    return originalPush(obj);
  };

  // Public emitter (ensures 'event' and wraps data)
  window.njTrack = function(eventName, payload){
    const p = Object.assign({}, payload||{});
    // Optional boost IQ for interaction events
    const positive = ['form_field_focus','form_field_complete','add_to_cart','view_item','begin_checkout','purchase','resource_download','help_article_read','video_engagement'];
    if (positive.includes(eventName)) bumpIQ(1);
    window.dataLayer.push(Object.assign({ event: eventName, timestamp: new Date().toISOString() }, p));
  };

  // Bind resource downloads (adds user context automatically via patched push)
  function bindResourceDownloads(){
    document.querySelectorAll('a[data-resource]')?.forEach(a => {
      a.addEventListener('click', () => {
        window.njTrack('resource_download', {
          resource_name: a.getAttribute('data-resource-name') || a.textContent?.trim() || 'unknown',
          resource_type: a.getAttribute('data-resource-type') || 'file',
          resource_category: a.getAttribute('data-resource-category') || 'general'
        });
      });
    });
  }

  // Help article dwell tracking
  function bindHelpArticles(){
    const nodes = document.querySelectorAll('.help-article');
    if (!nodes.length || !('IntersectionObserver' in window)) return;
    const seen = new Map();
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('data-article-id') || 'unknown';
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          seen.set(id, Date.now());
        } else if (seen.has(id)) {
          const start = seen.get(id); seen.delete(id);
          const spent = Math.max(1, Math.round((Date.now()-start)/1000));
          window.njTrack('help_article_read', { article_id: id, time_spent: spent, helpfulness_rating: null });
        }
      });
    }, { threshold: [0.5] });
    nodes.forEach(n => obs.observe(n));
  }

  // Scroll depth tracking to feed content_engagement_depth
  function bindScrollDepth(){
    let sent = {25:false,50:false,75:false,100:false};
    function handler(){
      const h=document.documentElement, b=document.body;
      const pct = Math.round(((h.scrollTop||b.scrollTop) / ((h.scrollHeight||b.scrollHeight)-h.clientHeight))*100);
      [25,50,75,100].forEach(p => { if (!sent[p] && pct>=p){ sent[p]=true; ses.setItem('content_depth', String(p)); window.njTrack('scroll_depth', { percentage: p }); }});
    }
    window.addEventListener('scroll', handler, { passive:true });
  }

  // 15s engagement timer
  function bindEngagementTimer(){
    setInterval(()=>{ window.njTrack('timer_engagement', { session_seconds: sessionSeconds() }); }, 15000);
  }

  // Auto mark returning
  document.addEventListener('DOMContentLoaded', function(){
    loc.setItem('has_returned','true');
    // Session start
    window.njTrack('session_start', {});
    bindResourceDownloads();
    bindHelpArticles();
    bindScrollDepth();
    bindEngagementTimer();
    // Begin registration attribution
    document.querySelectorAll('a[href*="register/step-1"]').forEach(a => {
      a.addEventListener('click', ()=>{
        window.njTrack('begin_registration', { entry_point: 'home_cta', device_type: (window.innerWidth<768? 'mobile':'desktop') });
      });
    });
  });

  // Form helpers (optional import by pages)
  window.njForm = {
    progress(form){
      const total = form.querySelectorAll('input,select,textarea').length;
      const filled = Array.from(form.querySelectorAll('input,select,textarea')).filter(f => (f.type==='checkbox'||f.type==='radio')? f.checked : !!f.value).length;
      const pct = total>0? Math.round((filled/total)*100) : 0;
      window.njTrack('form_progress', { percentage_complete: pct, fields_remaining: Math.max(0,total-filled) });
      return pct;
    }
  };

  // Video engagement helper (binds milestones 25/50/75/100)
  window.njBindVideo = function(videoEl, title){
    const marks = new Set();
    videoEl.addEventListener('timeupdate', () => {
      if (!videoEl.duration || videoEl.duration === Infinity) return;
      const pct = Math.round((videoEl.currentTime / videoEl.duration) * 100);
      [25,50,75,100].forEach(p => { if (pct>=p && !marks.has(p)) { marks.add(p); window.njTrack('video_engagement', { video_title: title, percentage_watched: p, engagement_points: p/25 }); }});
    });
  };

})();
