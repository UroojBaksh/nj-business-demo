# New Jersey Business Portal Demo (Static Prototype)

This is a static, multi-page demo of a NJ Business Portal with Google Analytics 4 (GA4) cross-domain tracking and a comprehensive data layer.

Contents live under public/nj-business-demo so they are served as-is by the frontend at /nj-business-demo/.

Key features:
- GA4 + GTM integration with cross-domain linker (decorated links and forms)
- Persistent user property schema (localStorage/sessionStorage)
- 4-step registration with detailed form analytics
- Enhanced Ecommerce for permits (catalog, details, checkout, purchase)
- Resources, MWBE programs, and Help center pages

How to run locally:
1. yarn start (root React app). Then navigate to http://localhost:3000/nj-business-demo/index.html

GitHub Pages:
- Host the folder as-is in a gh-pages site; update GA4 linker domains to include your GitHub Pages origin.

Data Layer Schema:
- Implemented per problem statement in js/tracking.js and individual page scripts.

Cross-domain simulation:
- Primary: /nj-business-demo/index.html
- Secondary: /nj-business-demo/state-portal.html (receives linker params and preserves state)

Notes:
- All analytics are demo-only with placeholder IDs.
- PDF is a lightweight placeholder used solely for download tracking.
