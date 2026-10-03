/**
 * Capstone E-Commerce UI Renderer Module
 * Featured Indian Products & Brands Rendering (₹ / INR formatting, GST calculation)
 */

class UI {
  /**
   * Helper: Format Currency in Indian Rupees (₹ / INR)
   */
  static formatCurrency(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  }

  /**
   * Render Star Rating SVGs
   */
  static renderRatingStars(rating) {
    const fullStars = Math.floor(rating);
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsHtml += '★';
      } else {
        starsHtml += '☆';
      }
    }
    return `<span style="color:var(--color-accent); font-size:1rem;">${starsHtml}</span> <span>(${rating.toFixed(1)})</span>`;
  }

  /**
   * Render Product Card Node
   */
  static renderProductCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      ${product.badge ? `<span class="card-badge badge-${product.badge.toLowerCase()}">${product.badge}</span>` : ''}
      <a href="#product-detail/${product.id}" class="product-image-box" aria-label="View details for ${product.title}">
        ${window.ProductCatalog.getSvgIcon(product.iconType)}
      </a>
      <div class="product-info">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="product-category">${product.category}</span>
          <span style="font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">${product.brand}</span>
        </div>
        <h3 class="product-title">
          <a href="#product-detail/${product.id}" style="text-decoration:none; color:inherit;">${product.title}</a>
        </h3>
        <div class="product-rating">${UI.renderRatingStars(product.rating)}</div>
        <div class="product-footer">
          <div>
            <span class="product-price">${UI.formatCurrency(product.price)}</span>
            ${product.originalPrice ? `<span class="original-price">${UI.formatCurrency(product.originalPrice)}</span>` : ''}
          </div>
          <button type="button" class="btn-add-cart" data-add-id="${product.id}">
            Add to Cart
          </button>
        </div>
      </div>
    `;
    return card;
  }

  /**
   * 1. Render Home View
   */
  static renderHomeView() {
    const wrapper = document.createElement('div');
    const featured = window.ProductCatalog.getAll().slice(0, 4);

    wrapper.innerHTML = `
      <!-- Hero Banner -->
      <section class="hero-banner" aria-label="Capstone Store Introduction">
        <div>
          <h1 class="hero-title">Top Indian Tech &amp; Lifestyle Brands</h1>
          <p class="hero-sub">
            Built by <strong>SUCHITH KUMAR V S</strong> at SRM Easwari Engineering College. Featuring top Indian brands: <strong>boAt</strong>, <strong>Noise</strong>, <strong>Titan</strong>, <strong>Fire-Boltt</strong>, <strong>Boult Audio</strong>, <strong>Portronics</strong>, <strong>Zebronics</strong> &amp; <strong>Cultsport</strong>.
          </p>
          <a href="#products" class="btn-cta">
            <span>Explore Indian Products</span> &rarr;
          </a>
        </div>
        <div style="text-align:center;">
          <svg viewBox="0 0 200 200" width="180" height="180" style="filter:drop-shadow(0 10px 20px rgba(0,0,0,0.2));">
            <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.15)"/>
            <rect x="50" y="60" width="100" height="90" rx="12" fill="#ffffff"/>
            <path d="M70 60 C70 40 85 25 100 25 C115 25 130 40 130 60" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
            <circle cx="85" cy="95" r="8" fill="#0284c7"/>
            <circle cx="115" cy="95" r="8" fill="#0284c7"/>
          </svg>
        </div>
      </section>

      <!-- Featured Products Section -->
      <section aria-label="Featured Products">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <h2 style="font-size:1.5rem; font-weight:800;">Featured Indian Products</h2>
          <a href="#products" style="color:var(--color-primary); font-weight:700; text-decoration:none;">View All (${window.ProductCatalog.getAll().length}) &rarr;</a>
        </div>
        <div id="home-featured-grid" class="product-grid"></div>
      </section>
    `;

    const grid = wrapper.querySelector('#home-featured-grid');
    featured.forEach(p => grid.appendChild(UI.renderProductCard(p)));

    return wrapper;
  }

  /**
   * 2. Render Products Catalog View
   */
  static renderProductsView() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <section aria-label="Product Catalog">
        <h1 style="font-size:1.75rem; font-weight:900; margin-bottom:1rem;">Indian Brand Products Catalog</h1>
        
        <!-- Filter & Search Toolbar -->
        <div class="catalog-toolbar">
          <div class="search-input-group">
            <svg class="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="search" id="catalog-search" placeholder="Search boAt, Noise, Titan, Fire-Boltt..." aria-label="Search products">
          </div>

          <div class="filter-group">
            <label for="brand-select" class="sr-only">Filter by Brand</label>
            <select id="brand-select" class="select-control" aria-label="Filter by Brand">
              <option value="all">All Brands</option>
              <option value="boAt">boAt</option>
              <option value="Noise">Noise</option>
              <option value="Titan">Titan</option>
              <option value="Fire-Boltt">Fire-Boltt</option>
              <option value="Boult Audio">Boult Audio</option>
              <option value="Portronics">Portronics</option>
              <option value="Zebronics">Zebronics</option>
              <option value="Cultsport">Cultsport</option>
            </select>

            <label for="category-select" class="sr-only">Filter by Category</label>
            <select id="category-select" class="select-control" aria-label="Filter by Category">
              <option value="all">All Categories</option>
              <option value="Audio">Audio</option>
              <option value="Wearables">Wearables</option>
              <option value="Accessories">Accessories</option>
              <option value="Electronics">Electronics</option>
            </select>

            <label for="sort-select" class="sr-only">Sort By</label>
            <select id="sort-select" class="select-control" aria-label="Sort By">
              <option value="featured">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Name: A to Z</option>
            </select>
          </div>
        </div>

        <div id="catalog-products-grid" class="product-grid"></div>
      </section>
    `;

    const grid = wrapper.querySelector('#catalog-products-grid');
    const searchInput = wrapper.querySelector('#catalog-search');
    const brandSelect = wrapper.querySelector('#brand-select');
    const categorySelect = wrapper.querySelector('#category-select');
    const sortSelect = wrapper.querySelector('#sort-select');

    const updateGrid = () => {
      grid.innerHTML = '';
      const filtered = window.ProductCatalog.filterAndSort(window.ProductCatalog.getAll(), {
        category: categorySelect.value,
        brand: brandSelect.value,
        search: searchInput.value,
        sortBy: sortSelect.value
      });

      if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted); font-weight:600;">No products match your filter criteria.</div>`;
        return;
      }

      filtered.forEach(p => grid.appendChild(UI.renderProductCard(p)));
    };

    searchInput.addEventListener('input', updateGrid);
    brandSelect.addEventListener('change', updateGrid);
    categorySelect.addEventListener('change', updateGrid);
    sortSelect.addEventListener('change', updateGrid);

    // Initial populate
    setTimeout(updateGrid, 0);

    return wrapper;
  }

  /**
   * 3. Render Product Detail View
   */
  static renderProductDetailView({ id }) {
    const product = window.ProductCatalog.getById(id);
    const wrapper = document.createElement('div');

    if (!product) {
      wrapper.innerHTML = `
        <div style="text-align:center; padding:4rem 1rem;">
          <h2>Product Not Found</h2>
          <p style="color:var(--text-muted); margin-bottom:1.5rem;">The product you are looking for does not exist.</p>
          <a href="#products" class="btn-cta">Back to Catalog</a>
        </div>
      `;
      return wrapper;
    }

    wrapper.innerHTML = `
      <div style="background-color:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:2.5rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:2.5rem; align-items:center;">
        <div style="background-color:var(--bg-subtle); border-radius:var(--radius-lg); padding:3rem; text-align:center;">
          ${window.ProductCatalog.getSvgIcon(product.iconType)}
        </div>
        <div>
          <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem;">
            <span style="font-size:0.85rem; font-weight:700; color:var(--color-primary); text-transform:uppercase;">${product.category}</span>
            <span style="font-size:0.85rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">&bull; ${product.brand}</span>
          </div>
          <h1 style="font-size:2rem; font-weight:900; margin:0 0 0.75rem 0;">${product.title}</h1>
          <div style="margin-bottom:1rem;">${UI.renderRatingStars(product.rating)} &bull; ${product.reviewsCount} verified Indian buyer reviews</div>
          <div style="font-size:2rem; font-weight:900; color:var(--text-main); margin-bottom:1rem;">
            ${UI.formatCurrency(product.price)}
            ${product.originalPrice ? `<span class="original-price" style="font-size:1.1rem;">${UI.formatCurrency(product.originalPrice)}</span>` : ''}
            <span style="font-size:0.85rem; color:var(--color-success); font-weight:700; margin-left:0.5rem;">Incl. GST &amp; Free Express Delivery across India</span>
          </div>
          <p style="color:var(--text-secondary); font-size:1rem; line-height:1.6; margin-bottom:1.75rem;">${product.description}</p>
          <div style="display:flex; gap:1rem;">
            <button type="button" class="btn-cta" data-add-id="${product.id}" style="border:none; cursor:pointer;">
              Add to Cart
            </button>
            <a href="#products" class="btn-cta" style="background-color:var(--bg-subtle); color:var(--text-main);">
              &larr; Back to Catalog
            </a>
          </div>
        </div>
      </div>
    `;

    return wrapper;
  }

  /**
   * 4. Render Checkout View
   */
  static renderCheckoutView() {
    const store = window.appStore;
    const wrapper = document.createElement('div');

    if (store.cart.length === 0) {
      wrapper.innerHTML = `
        <div style="text-align:center; padding:4rem 1rem;">
          <h2>Your Shopping Cart is Empty</h2>
          <p style="color:var(--text-muted); margin-bottom:1.5rem;">Add some Indian brand products to your cart before checking out.</p>
          <a href="#products" class="btn-cta">Browse Products</a>
        </div>
      `;
      return wrapper;
    }

    wrapper.innerHTML = `
      <section aria-label="Checkout Process">
        <h1 style="font-size:1.75rem; font-weight:900; margin-bottom:1.5rem;">Checkout &amp; Shipping in India</h1>
        
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:2rem;">
          <!-- Shipping Form Card -->
          <div style="background-color:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:1.75rem;">
            <h2 style="font-size:1.25rem; font-weight:800; margin-bottom:1rem;">Delivery Address (India)</h2>
            <form id="checkout-form" style="display:flex; flex-direction:column; gap:1rem;">
              <div>
                <label style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:0.25rem;">Full Name</label>
                <input type="text" required value="Suchith Kumar V S" style="width:100%; min-height:42px; padding:0.5rem 0.85rem; border:1px solid var(--border-color); border-radius:var(--radius-md);">
              </div>
              <div>
                <label style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:0.25rem;">Mobile Number (+91)</label>
                <input type="tel" required value="+91 98765 43210" style="width:100%; min-height:42px; padding:0.5rem 0.85rem; border:1px solid var(--border-color); border-radius:var(--radius-md);">
              </div>
              <div>
                <label style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:0.25rem;">Shipping Address &amp; College Campus</label>
                <input type="text" required value="SRM Easwari Engineering College, Bharathi Salai, Ramapuram" style="width:100%; min-height:42px; padding:0.5rem 0.85rem; border:1px solid var(--border-color); border-radius:var(--radius-md);">
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                <div>
                  <label style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:0.25rem;">City</label>
                  <input type="text" required value="Chennai" style="width:100%; min-height:42px; padding:0.5rem 0.85rem; border:1px solid var(--border-color); border-radius:var(--radius-md);">
                </div>
                <div>
                  <label style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:0.25rem;">State &amp; PIN Code</label>
                  <input type="text" required value="Tamil Nadu - 600089" style="width:100%; min-height:42px; padding:0.5rem 0.85rem; border:1px solid var(--border-color); border-radius:var(--radius-md);">
                </div>
              </div>
              <button type="submit" class="btn-checkout">Pay ${UI.formatCurrency(store.getTotal())} (UPI / NetBanking / COD)</button>
            </form>
          </div>

          <!-- Order Summary Card -->
          <div style="background-color:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:1.75rem;">
            <h2 style="font-size:1.25rem; font-weight:800; margin-bottom:1rem;">Order Summary</h2>
            ${store.cart.map(item => `
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; font-size:0.95rem;">
                <div>
                  <strong>${item.product.title}</strong>
                  <div style="color:var(--text-muted); font-size:0.85rem;">Brand: ${item.product.brand} &bull; Qty: ${item.quantity} × ${UI.formatCurrency(item.product.price)}</div>
                </div>
                <div style="font-weight:800;">${UI.formatCurrency(item.product.price * item.quantity)}</div>
              </div>
            `).join('')}
            <div style="border-top:1px solid var(--border-subtle); margin-top:1rem; padding-top:1rem;">
              <div class="summary-row"><span>Subtotal:</span><span>${UI.formatCurrency(store.getSubtotal())}</span></div>
              <div class="summary-row"><span>GST (18% Included):</span><span>${UI.formatCurrency(store.getTax())}</span></div>
              <div class="summary-row"><span>Delivery (India):</span><span>${store.getShipping() === 0 ? 'FREE' : UI.formatCurrency(store.getShipping())}</span></div>
              <div class="total-row summary-row"><span>Total Payable:</span><span>${UI.formatCurrency(store.getTotal())}</span></div>
            </div>
          </div>
        </div>
      </section>
    `;

    setTimeout(() => {
      const form = wrapper.querySelector('#checkout-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          store.clearCart();
          UI.showToast('🎉 Order Placed Successfully via UPI!');
          window.Router.navigate('#home');
        });
      }
    }, 0);

    return wrapper;
  }

  /**
   * 5. Render About View
   */
  static renderAboutView() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <section style="background-color:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-xl); padding:2.5rem;" aria-label="About Project & Developer">
        <h1 style="font-size:2rem; font-weight:900; margin-bottom:1rem;">About Indian Brands E-Commerce Capstone</h1>
        <p style="font-size:1.05rem; line-height:1.7; color:var(--text-secondary); margin-bottom:1.5rem;">
          This Capstone Project showcases leading Indian technology &amp; lifestyle brands (boAt, Noise, Titan, Fire-Boltt, Boult, Portronics, Zebronics, Cultsport) formatted in Indian Rupees (₹ / INR), featuring client-side SPA routing, cart store management, and responsive CSS Grid design.
        </p>

        <div style="background-color:var(--bg-subtle); border-radius:var(--radius-lg); padding:1.5rem; margin-bottom:1.5rem;">
          <h2 style="font-size:1.25rem; font-weight:800; color:var(--color-primary); margin-bottom:0.5rem;">Developer Information</h2>
          <p><strong>Name:</strong> SUCHITH KUMAR V S</p>
          <p><strong>Institution:</strong> SRM Easwari Engineering College</p>
          <p><strong>Degree:</strong> B.E. Computer Science and Engineering (Second-Year Undergraduate)</p>
          <p><strong>Location:</strong> Chennai, Tamil Nadu, India</p>
          <p><strong>GitHub Repository:</strong> <a href="https://github.com/SuchithKumar2007" target="_blank" rel="noopener" style="color:var(--color-primary);">https://github.com/SuchithKumar2007</a></p>
        </div>
      </section>
    `;
    return wrapper;
  }

  /**
   * Toast Notification Helper
   */
  static showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
}

window.UI = UI;
