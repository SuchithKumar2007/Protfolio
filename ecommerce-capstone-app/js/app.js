/**
 * Capstone E-Commerce Application Controller
 * Connects Router, Store, UI, Sliding Cart Drawer, and Theme Engine.
 */

class App {
  constructor() {
    this.store = window.appStore;
    this.ui = window.UI;

    this.initElements();
    this.initRouter();
    this.initCartDrawer();
    this.initThemeEngine();
    this.bindEvents();

    // Subscribe to store mutations
    this.store.subscribe(() => {
      this.updateCartBadge();
      this.renderCartDrawerContents();
    });

    this.updateCartBadge();
  }

  initElements() {
    this.cartCountBadge = document.querySelector('#cart-count-badge');
    this.cartTriggerBtn = document.querySelector('#cart-trigger-btn');
    this.cartDrawer = document.querySelector('#cart-drawer');
    this.drawerBackdrop = document.querySelector('#drawer-backdrop');
    this.closeDrawerBtn = document.querySelector('#close-drawer-btn');
    this.drawerItemsContainer = document.querySelector('#drawer-items-container');
    this.drawerSubtotal = document.querySelector('#drawer-subtotal');
    this.drawerTax = document.querySelector('#drawer-tax');
    this.drawerTotal = document.querySelector('#drawer-total');
    this.checkoutBtn = document.querySelector('#drawer-checkout-btn');
    this.themeToggleBtn = document.querySelector('#theme-toggle-btn');
  }

  initRouter() {
    const routes = [
      { path: '#home', handler: () => this.ui.renderHomeView(), title: 'Home - Capstone E-Commerce' },
      { path: '#products', handler: () => this.ui.renderProductsView(), title: 'Catalog - Capstone E-Commerce' },
      { path: /^#product-detail\/(?<id>[\w-]+)$/, handler: (params) => this.ui.renderProductDetailView(params), title: 'Product Details' },
      { path: '#checkout', handler: () => this.ui.renderCheckoutView(), title: 'Checkout' },
      { path: '#about', handler: () => this.ui.renderAboutView(), title: 'About Developer' }
    ];

    window.appRouter = new window.Router(routes);
  }

  initCartDrawer() {
    if (this.cartTriggerBtn) {
      this.cartTriggerBtn.addEventListener('click', () => this.openCartDrawer());
    }

    if (this.closeDrawerBtn) {
      this.closeDrawerBtn.addEventListener('click', () => this.closeCartDrawer());
    }

    if (this.drawerBackdrop) {
      this.drawerBackdrop.addEventListener('click', () => this.closeCartDrawer());
    }

    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener('click', () => {
        this.closeCartDrawer();
        window.Router.navigate('#checkout');
      });
    }

    this.renderCartDrawerContents();
  }

  openCartDrawer() {
    if (this.cartDrawer) this.cartDrawer.classList.add('active');
    if (this.drawerBackdrop) this.drawerBackdrop.classList.add('active');
  }

  closeCartDrawer() {
    if (this.cartDrawer) this.cartDrawer.classList.remove('active');
    if (this.drawerBackdrop) this.drawerBackdrop.classList.remove('active');
  }

  renderCartDrawerContents() {
    if (!this.drawerItemsContainer) return;

    const cart = this.store.cart;
    this.drawerItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      this.drawerItemsContainer.innerHTML = `
        <div style="text-align:center; padding:3rem 1rem; color:var(--text-muted); font-weight:600;">
          Your shopping cart is currently empty.
        </div>
      `;
      if (this.checkoutBtn) this.checkoutBtn.disabled = true;
    } else {
      if (this.checkoutBtn) this.checkoutBtn.disabled = false;
      const fragment = document.createDocumentFragment();

      cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
          <div class="cart-item-img">
            ${window.ProductCatalog.getSvgIcon(item.product.iconType)}
          </div>
          <div class="cart-item-details">
            <div class="cart-item-title">${item.product.title}</div>
            <div class="cart-item-price">${this.ui.formatCurrency(item.product.price)}</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div class="qty-controls">
                <button type="button" class="qty-btn" data-qty-dec="${item.product.id}">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button type="button" class="qty-btn" data-qty-inc="${item.product.id}">+</button>
              </div>
              <button type="button" data-remove-id="${item.product.id}" style="background:none; border:none; color:var(--color-danger); font-size:0.8rem; font-weight:700; cursor:pointer;">
                Remove
              </button>
            </div>
          </div>
        `;
        fragment.appendChild(div);
      });

      this.drawerItemsContainer.appendChild(fragment);
    }

    // Update Totals
    if (this.drawerSubtotal) this.drawerSubtotal.textContent = this.ui.formatCurrency(this.store.getSubtotal());
    if (this.drawerTax) this.drawerTax.textContent = this.ui.formatCurrency(this.store.getTax());
    if (this.drawerTotal) this.drawerTotal.textContent = this.ui.formatCurrency(this.store.getTotal());
  }

  updateCartBadge() {
    if (this.cartCountBadge) {
      const count = this.store.getCartCount();
      this.cartCountBadge.textContent = count;
      this.cartCountBadge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  bindEvents() {
    // Global Event Delegation for Cart Actions
    document.addEventListener('click', (e) => {
      // Add to Cart
      const addBtn = e.target.closest('[data-add-id]');
      if (addBtn) {
        const id = addBtn.dataset.addId;
        const product = window.ProductCatalog.getById(id);
        if (product) {
          this.store.addToCart(product, 1);
          this.ui.showToast(`🛒 Added "${product.title}" to cart`);
        }
      }

      // Quantity Increase
      const incBtn = e.target.closest('[data-qty-inc]');
      if (incBtn) {
        const id = incBtn.dataset.qtyInc;
        const item = this.store.cart.find(i => i.product.id === id);
        if (item) this.store.updateQuantity(id, item.quantity + 1);
      }

      // Quantity Decrease
      const decBtn = e.target.closest('[data-qty-dec]');
      if (decBtn) {
        const id = decBtn.dataset.qtyDec;
        const item = this.store.cart.find(i => i.product.id === id);
        if (item) this.store.updateQuantity(id, item.quantity - 1);
      }

      // Remove Item
      const removeBtn = e.target.closest('[data-remove-id]');
      if (removeBtn) {
        const id = removeBtn.dataset.removeId;
        this.store.removeFromCart(id);
        this.ui.showToast('Removed item from cart');
      }
    });
  }

  initThemeEngine() {
    const savedTheme = localStorage.getItem('suchith_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => {
        const curr = document.documentElement.getAttribute('data-theme') || 'light';
        const next = curr === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('suchith_theme', next);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.capstoneApp = new App();
});
