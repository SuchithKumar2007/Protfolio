/**
 * Capstone E-Commerce Centralized State Store
 * Manages cart CRUD, quantity updates, total calculations (₹ / INR), and localStorage persistence.
 */

const CART_STORAGE_KEY = 'suchith_capstone_cart';

class Store {
  constructor() {
    this.cart = this.loadCart();
    this.listeners = [];
  }

  loadCart() {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
    } catch (e) {}
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.cart));
  }

  addToCart(product, quantity = 1) {
    const existing = this.cart.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({ product, quantity });
    }
    this.saveCart();
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.product.id !== productId);
    this.saveCart();
  }

  updateQuantity(productId, newQty) {
    if (newQty <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const item = this.cart.find(i => i.product.id === productId);
    if (item) {
      item.quantity = newQty;
      this.saveCart();
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  getTax() {
    // 18% GST estimate
    return this.getSubtotal() * 0.18;
  }

  getShipping() {
    // Free delivery across India for orders above ₹999
    return this.getSubtotal() >= 999 || this.cart.length === 0 ? 0 : 99;
  }

  getTotal() {
    return this.getSubtotal() + this.getShipping();
  }
}

window.appStore = new Store();
