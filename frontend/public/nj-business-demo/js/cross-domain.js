class CrossDomainTracker {
  constructor() {
    this.measurementId = 'G-DEMO123456';
    this.linkerParam = '_gl';
    this.init();
  }

  init() {
    this.decorateLinks();
    this.processIncomingLinker();
    this.observeDynamicLinks();
  }

  decorateLinks() {
    const crossDomainSelectors = [
      'a[href*="state-portal.html"]',
      'a[href*="external-resource"]',
      'form[action*="state-portal"]'
    ];

    crossDomainSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        element.addEventListener('click', (e) => {
          e.preventDefault();
          this.decorateAndNavigate(element.href || element.action);
        });
      });
    });
  }

  decorateAndNavigate(url) {
    if (window.gtag) {
      gtag('get', this.measurementId, 'linker', (linker) => {
        const decoratedUrl = linker.decorate(url);
        gtag('event', 'cross_domain_navigation', {
          'destination_url': url,
          'linker_added': true,
          'timestamp': new Date().toISOString()
        });
        window.location.href = decoratedUrl;
      });
    } else {
      console.error('gtag not loaded');
      window.location.href = url;
    }
  }

  processIncomingLinker() {
    const params = new URLSearchParams(window.location.search);
    if (params.has(this.linkerParam)) {
      const linkerValue = params.get(this.linkerParam);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'cross_domain_arrival',
        'cross_domain_data': {
          'source_domain': document.referrer,
          'linker_present': true,
          'linker_value': linkerValue.substring(0, 10) + '...'
        }
      });
      sessionStorage.setItem('cross_domain_source', document.referrer);
      this.cleanUrl();
    }
  }

  cleanUrl() {
    const url = new URL(window.location);
    url.searchParams.delete(this.linkerParam);
    window.history.replaceState({}, '', url.toString());
  }

  observeDynamicLinks() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.tagName === 'A') {
            if (node.href && node.href.includes('state-portal')) {
              node.addEventListener('click', (e) => {
                e.preventDefault();
                this.decorateAndNavigate(node.href);
              });
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

document.addEventListener('DOMContentLoaded', () => { new CrossDomainTracker(); });
