/**
 * Capstone E-Commerce Products Dataset & Catalog Module
 * Featured Indian Brands & Products Catalog (boAt, Noise, Titan, Fire-Boltt, Boult, Portronics, Zebronics, Cultsport)
 */

const CAPSTONE_PRODUCTS = [
  {
    id: 'prod-1',
    title: 'boAt Airdopes 141 ANC Wireless Earbuds',
    brand: 'boAt',
    category: 'Audio',
    price: 1499,
    originalPrice: 4490,
    rating: 4.8,
    reviewsCount: 2450,
    badge: 'Bestseller',
    description: '32dB Active Noise Cancellation with 42-hour total playback, Beast Mode sub-50ms low latency, and ENx Technology crisp quad mics.',
    iconType: 'headphones'
  },
  {
    id: 'prod-2',
    title: 'Noise ColorFit Pulse 2 Max Smartwatch',
    brand: 'Noise',
    category: 'Wearables',
    price: 1299,
    originalPrice: 4999,
    rating: 4.7,
    reviewsCount: 1890,
    badge: 'Bestseller',
    description: 'Massive 1.85" TFT display with Tru Sync Bluetooth calling, 550 nits brightness, 100+ sports modes, and 10-day battery life.',
    iconType: 'smartwatch'
  },
  {
    id: 'prod-3',
    title: 'Titan Neo Analog Quartz Black Dial Men Watch',
    brand: 'Titan',
    category: 'Wearables',
    price: 2995,
    originalPrice: 3745,
    rating: 4.9,
    reviewsCount: 820,
    badge: 'Sale',
    description: 'Premium stainless steel strap with water-resistant mineral glass crystal and classic Indian craftsmanship.',
    iconType: 'smartwatch'
  },
  {
    id: 'prod-4',
    title: 'Fire-Boltt Ninja Call Pro Plus Smartwatch',
    brand: 'Fire-Boltt',
    category: 'Wearables',
    price: 1199,
    originalPrice: 9999,
    rating: 4.6,
    reviewsCount: 1420,
    badge: 'New',
    description: '1.83" HD display with Voice Assistant, SpO2 & HR tracking, IP67 rating, and 100+ cloud-based watch faces.',
    iconType: 'smartwatch'
  },
  {
    id: 'prod-5',
    title: 'Boult Audio FXCharge Wireless Neckband',
    brand: 'Boult Audio',
    category: 'Audio',
    price: 899,
    originalPrice: 2999,
    rating: 4.5,
    reviewsCount: 1100,
    badge: 'Sale',
    description: '32-hour playback with Type-C Fast Charging (10 mins charge = 7 hours playback), Environmental Noise Cancellation, and IPX5 water resistance.',
    iconType: 'headphones'
  },
  {
    id: 'prod-6',
    title: 'Portronics SoundDrum P 20W Portable Speaker',
    brand: 'Portronics',
    category: 'Audio',
    price: 1799,
    originalPrice: 3499,
    rating: 4.8,
    reviewsCount: 760,
    badge: 'Bestseller',
    description: '20W immersive stereo output with Type-C charging, hands-free calling, USB/AUX/FM support, and 7-hour playback.',
    iconType: 'speaker'
  },
  {
    id: 'prod-7',
    title: 'Zebronics Transformer Gaming Keyboard & Mouse Combo',
    brand: 'Zebronics',
    category: 'Accessories',
    price: 1099,
    originalPrice: 1999,
    rating: 4.6,
    reviewsCount: 950,
    badge: 'New',
    description: 'Multi-color LED modes with braided cable, gold-plated USB connector, ergonomic wrist support, and 3200 DPI mouse.',
    iconType: 'keyboard'
  },
  {
    id: 'prod-8',
    title: 'Cultsport Smart Fit Workout Companion',
    brand: 'Cultsport',
    category: 'Electronics',
    price: 3499,
    originalPrice: 6999,
    rating: 4.9,
    reviewsCount: 430,
    badge: 'New',
    description: 'Smart Bluetooth fitness tracker integrated with Cultpass live workouts, body composition analysis, and activity tracking.',
    iconType: 'monitor'
  }
];

class ProductCatalog {
  static getAll() {
    return CAPSTONE_PRODUCTS;
  }

  static getById(id) {
    return CAPSTONE_PRODUCTS.find(p => p.id === id);
  }

  /**
   * Filter and sort products dynamically
   */
  static filterAndSort(products, { category = 'all', brand = 'all', search = '', sortBy = 'featured' }) {
    let result = [...products];

    // 1. Category Filter
    if (category && category !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // 2. Brand Filter
    if (brand && brand !== 'all') {
      result = result.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }

    // 3. Search Query Filter
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // 4. Sorting Logic
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // 'featured'
        break;
    }

    return result;
  }

  /**
   * SVG Icon Factory for Products
   */
  static getSvgIcon(iconType) {
    switch (iconType) {
      case 'headphones':
        return `<svg class="product-svg-icon" viewBox="0 0 64 64" fill="none"><path d="M12 36V28C12 17 21 8 32 8C43 8 52 17 52 28V36" stroke="#0284c7" stroke-width="4" stroke-linecap="round"/><rect x="8" y="32" width="10" height="20" rx="5" fill="#38bdf8"/><rect x="46" y="32" width="10" height="20" rx="5" fill="#38bdf8"/></svg>`;
      case 'smartwatch':
        return `<svg class="product-svg-icon" viewBox="0 0 64 64" fill="none"><rect x="22" y="6" width="20" height="12" rx="3" fill="#64748b"/><rect x="22" y="46" width="20" height="12" rx="3" fill="#64748b"/><rect x="16" y="16" width="32" height="32" rx="10" fill="#0284c7"/><circle cx="32" cy="32" r="10" fill="#38bdf8"/></svg>`;
      case 'keyboard':
        return `<svg class="product-svg-icon" viewBox="0 0 64 64" fill="none"><rect x="8" y="18" width="48" height="28" rx="6" fill="#0284c7"/><rect x="14" y="24" width="8" height="6" rx="1" fill="#ffffff"/><rect x="28" y="24" width="8" height="6" rx="1" fill="#ffffff"/><rect x="42" y="24" width="8" height="6" rx="1" fill="#ffffff"/><rect x="20" y="34" width="24" height="6" rx="2" fill="#38bdf8"/></svg>`;
      case 'mouse':
        return `<svg class="product-svg-icon" viewBox="0 0 64 64" fill="none"><rect x="18" y="12" width="28" height="40" rx="14" fill="#0284c7"/><line x1="32" y1="12" x2="32" y2="28" stroke="#38bdf8" stroke-width="3"/><rect x="30" y="20" width="4" height="8" rx="2" fill="#ffffff"/></svg>`;
      case 'speaker':
        return `<svg class="product-svg-icon" viewBox="0 0 64 64" fill="none"><rect x="18" y="10" width="28" height="44" rx="8" fill="#0284c7"/><circle cx="32" cy="22" r="6" fill="#38bdf8"/><circle cx="32" cy="40" r="8" fill="#38bdf8"/></svg>`;
      case 'monitor':
        return `<svg class="product-svg-icon" viewBox="0 0 64 64" fill="none"><rect x="6" y="12" width="52" height="34" rx="4" fill="#0284c7"/><rect x="10" y="16" width="44" height="26" rx="2" fill="#e0f2fe"/><path d="M26 46L24 56H40L38 46" stroke="#64748b" stroke-width="4"/></svg>`;
      default:
        return `<svg class="product-svg-icon" viewBox="0 0 64 64" fill="none"><rect x="12" y="12" width="40" height="40" rx="8" fill="#0284c7"/></svg>`;
    }
  }
}

window.ProductCatalog = ProductCatalog;
