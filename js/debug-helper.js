/* GA4 Debug Helper: Intercepts dataLayer pushes, shows floating console, exports JSON, validates setup */
(function(){
  class GA4DebugHelper {
    constructor(){
      this.isDebugMode = localStorage.getItem('ga4_debug') === 'true';
      this.events = [];
      this.init();
    }
    init(){
      if (typeof window.dataLayer === 'undefined') window.dataLayer = [];
      if (this.isDebugMode){
        this.createDebugPanel();
        this.interceptDataLayer();
        this.monitorNetworkRequests();
        console.log('GA4 Debug Mode Active');
      }
    }
    createDebugPanel(){
      const panel = document.createElement('div');
      panel.id = 'ga4-debug-panel';
      panel.innerHTML = `
      <div style="position: fixed; bottom: 20px; right: 20px; width: 400px; max-height: 500px; background: #ffffff; border: 2px solid #002D62; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 10000; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
        <div style="background: #002D62; color: #ffffff; padding: 10px; border-radius: 6px 6px 0 0; display: flex; justify-content: space-between; align-items: center;">
          <span>GA4 Debug Console</span>
          <button onclick="document.getElementById('ga4-debug-panel').remove()" style="background:none; border:none; color:#ffffff; cursor:pointer; font-size:16px;">✕</button>
        </div>
        <div style="padding:10px; max-height:400px; overflow-y:auto;" id="debug-events">
          <div style="color:#28A745;">Debug Mode Active</div>
        </div>
        <div style="padding: 10px; border-top: 1px solid #e5e7eb; display:flex; gap:8px;">
          <button onclick="ga4Debug.clearEvents()">Clear</button>
          <button onclick="ga4Debug.exportEvents()">Export JSON</button>
          <button onclick="ga4Debug.validateSetup()">Validate Setup</button>
        </div>
      </div>`;
      document.body.appendChild(panel);
    }
    interceptDataLayer(){
      const self = this;
      const originalPush = window.dataLayer.push.bind(window.dataLayer);
      window.dataLayer.push = function(){
        const result = originalPush.apply(window.dataLayer, arguments);
        try {
          const eventObj = arguments[0];
          self.logEvent(eventObj);
        } catch(e) { /* ignore */ }
        return result;
      };
    }
    logEvent(event){
      const wrapped = { timestamp: new Date().toISOString(), event };
      this.events.push(wrapped);
      if (this.isDebugMode){
        const container = document.getElementById('debug-events');
        if (container){
          const div = document.createElement('div');
          div.style.cssText = 'margin:5px 0; padding:6px; background:#f8f9fa; border-left:3px solid #5B9BD5;';
          const name = (event && event.event) ? event.event : 'pageview';
          const time = new Date().toLocaleTimeString();
          const body = JSON.stringify(event, null, 2);
          div.innerHTML = `<div style="font-weight:600; color:#002D62;">${time} - ${name}</div><pre style="margin:0; font-size:11px; color:#374151; white-space:pre-wrap;">${body.length>1200? body.slice(0,1200)+'…' : body}</pre>`;
          container.appendChild(div);
          container.scrollTop = container.scrollHeight;
        }
      }
      console.log('GA4 Event', event);
    }
    monitorNetworkRequests(){
      const originalFetch = window.fetch;
      window.fetch = function(){
        try {
          const url = arguments[0];
          if (typeof url === 'string' && (url.includes('google-analytics.com') || url.includes('googletagmanager.com'))){
            console.log('GA4/GTM Network Request', url);
          }
        } catch(e) { /* ignore */ }
        return originalFetch.apply(this, arguments);
      };
    }
    validateSetup(){
      const validations = {
        'GTM Loaded': !!window.google_tag_manager,
        'GA4 Loaded': !!window.gtag,
        'DataLayer Present': !!window.dataLayer,
        'Cross-Domain Configured': this.checkCrossDomain(),
        'Enhanced Ecommerce': this.checkEcommerce(),
        'User Properties Set': this.checkUserProperties()
      };
      console.table(validations);
      const ok = Object.values(validations).every(Boolean);
      alert(ok ? 'All validations passed' : 'Some validations failed. See console for details.');
    }
    checkCrossDomain(){
      try {
        return Array.isArray(window.dataLayer) && window.dataLayer.some(item => typeof item === 'object' && JSON.stringify(item).includes('linker'));
      } catch(e) { return false; }
    }
    checkEcommerce(){
      try {
        return this.events.some(e => e && e.event && ['add_to_cart','purchase','view_item','view_item_list','begin_checkout'].includes(e.event.event));
      } catch(e) { return false; }
    }
    checkUserProperties(){
      // Accept either session or local storage presence as indicator
      return sessionStorage.getItem('business_type') !== null || localStorage.getItem('business_type') !== null;
    }
    clearEvents(){
      this.events = [];
      const container = document.getElementById('debug-events');
      if (container){ container.innerHTML = '<div style="color:#28A745;">Events Cleared</div>'; }
    }
    exportEvents(){
      const dataStr = JSON.stringify(this.events, null, 2);
      const uri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const a = document.createElement('a');
      a.setAttribute('href', uri);
      a.setAttribute('download', `ga4-events-${Date.now()}.json`);
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
  }
  // Expose and init
  window.GA4DebugHelper = GA4DebugHelper;
  window.ga4Debug = new GA4DebugHelper();
  window.enableGA4Debug = function(){ localStorage.setItem('ga4_debug','true'); location.reload(); };
  window.disableGA4Debug = function(){ localStorage.removeItem('ga4_debug'); location.reload(); };
})();
