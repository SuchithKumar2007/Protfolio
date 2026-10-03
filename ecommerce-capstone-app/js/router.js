/**
 * Capstone E-Commerce Hash-Based SPA Client-Side Router
 * Handles seamless view transitions (#home, #products, #product-detail/:id, #checkout, #about)
 */

class Router {
  constructor(routes, containerSelector = '#app-view') {
    this.routes = routes; // Array of { path: RegExp | string, handler: Function, title: string }
    this.container = document.querySelector(containerSelector);
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('DOMContentLoaded', () => this.handleRoute());
  }

  handleRoute() {
    const rawHash = window.location.hash || '#home';
    const cleanHash = rawHash.split('?')[0];

    // Find matching route
    let matchedRoute = null;
    let params = {};

    for (const route of this.routes) {
      if (typeof route.path === 'string') {
        if (route.path === cleanHash) {
          matchedRoute = route;
          break;
        }
      } else if (route.path instanceof RegExp) {
        const match = cleanHash.match(route.path);
        if (match) {
          matchedRoute = route;
          params = match.groups || { id: match[1] };
          break;
        }
      }
    }

    if (!matchedRoute) {
      // Fallback to home
      window.location.hash = '#home';
      return;
    }

    // Update Document Title
    document.title = `${matchedRoute.title} | Capstone Store - Suchith Kumar V S`;

    // Update active nav link styling
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === cleanHash || (cleanHash === '#home' && href === '#')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    // Execute View Renderer
    if (this.container && matchedRoute.handler) {
      this.container.innerHTML = '';
      const viewNode = matchedRoute.handler(params);
      if (typeof viewNode === 'string') {
        this.container.innerHTML = viewNode;
      } else if (viewNode instanceof HTMLElement) {
        this.container.appendChild(viewNode);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  static navigate(hash) {
    window.location.hash = hash;
  }
}

window.Router = Router;
