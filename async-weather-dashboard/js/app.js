/**
 * Weather Dashboard Main Controller Module
 * Connects API, UI, event listeners, localStorage search history, and unit toggling
 */

const HISTORY_STORAGE_KEY = 'suchith_weather_search_history';
const UNIT_STORAGE_KEY = 'suchith_weather_temp_unit';
const DEFAULT_CITY = 'Chennai';

class WeatherApp {
  constructor() {
    this.api = window.WeatherAPI;
    this.ui = new window.WeatherUI();

    this.currentData = null;
    this.currentUnit = this.loadSavedUnit();
    this.searchHistory = this.loadSavedHistory();

    this.initElements();
    this.bindEvents();
    this.initApp();
  }

  initElements() {
    this.searchForm = document.querySelector('#search-form');
    this.searchInput = document.querySelector('#search-input');
    this.unitToggleBtn = document.querySelector('#unit-toggle');
    this.themeToggleBtn = document.querySelector('#theme-toggle');
    this.quickCitiesRow = document.querySelector('#quick-cities-row');
    this.historyPillsContainer = document.querySelector('#history-pills-container');
    this.locationBtn = document.querySelector('#current-location-btn');
  }

  bindEvents() {
    // 1. Search Form Submit
    if (this.searchForm) {
      this.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = this.searchInput.value.trim();
        if (query) {
          this.fetchAndRenderCity(query);
        }
      });
    }

    // 2. Unit Toggle (&deg;C / &deg;F)
    if (this.unitToggleBtn) {
      this.unitToggleBtn.addEventListener('click', () => {
        this.currentUnit = this.currentUnit === 'C' ? 'F' : 'C';
        this.saveUnitPreference(this.currentUnit);
        this.updateUnitButtonDisplay();

        // Re-render current weather with new unit
        if (this.currentData) {
          this.ui.renderWeather(this.currentData, this.currentUnit);
        }
      });
    }

    // 3. Quick Cities Pills & Search History Click
    document.addEventListener('click', (e) => {
      const cityPill = e.target.closest('[data-city]');
      if (cityPill) {
        const cityName = cityPill.dataset.city;
        if (cityName) {
          this.searchInput.value = cityName;
          this.fetchAndRenderCity(cityName);
        }
      }
    });

    // 4. Geolocation Button
    if (this.locationBtn) {
      this.locationBtn.addEventListener('click', () => {
        this.fetchCurrentLocationWeather();
      });
    }

    // 5. Theme Switcher
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        try {
          localStorage.setItem('suchith_theme', nextTheme);
        } catch (err) {}
      });
    }
  }

  /**
   * Application Initialization
   */
  async initApp() {
    // Restore theme from localStorage
    try {
      const savedTheme = localStorage.getItem('suchith_theme');
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    } catch (e) {}

    this.updateUnitButtonDisplay();
    this.ui.renderHistoryPills(this.searchHistory);

    // Initial load for default city
    await this.fetchAndRenderCity(DEFAULT_CITY);
  }

  /**
   * Main Async Workflow: Fetch weather for a city query
   * @param {string} cityName 
   */
  async fetchAndRenderCity(cityName) {
    this.ui.showLoading();

    try {
      // Modern Async/Await call to REST API
      const result = await this.api.getWeatherByCity(cityName);
      this.currentData = result;

      // Render nested JSON payload
      this.ui.renderWeather(result, this.currentUnit);

      // Save successful city to history
      this.addToHistory(result.city.name);
    } catch (err) {
      console.error('Weather fetch error:', err);
      this.ui.showError(err.message, 'Search Failure');
    }
  }

  /**
   * Async Geolocation Weather Lookup
   */
  fetchCurrentLocationWeather() {
    if (!navigator.geolocation) {
      this.ui.showError('Geolocation is not supported by your browser.', 'Location Unavailable');
      return;
    }

    this.ui.showLoading();

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const weatherData = await this.api.fetchWeather(lat, lon);

          const cityInfo = {
            name: 'Your Location',
            admin1: `${lat.toFixed(2)}°N`,
            country: `${lon.toFixed(2)}°E`,
            latitude: lat,
            longitude: lon
          };

          this.currentData = { city: cityInfo, weather: weatherData };
          this.ui.renderWeather(this.currentData, this.currentUnit);
        } catch (err) {
          this.ui.showError(err.message, 'Geolocation Error');
        }
      },
      (err) => {
        this.ui.showError('Unable to retrieve your current location. Please enter a city manually.', 'Location Access Denied');
      },
      { timeout: 10000 }
    );
  }

  /**
   * Search History Persistence
   */
  loadSavedHistory() {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['Chennai', 'Bangalore', 'London', 'Tokyo', 'New York'];
    } catch (e) {
      return ['Chennai', 'Bangalore', 'London', 'Tokyo', 'New York'];
    }
  }

  addToHistory(cityName) {
    if (!cityName) return;
    // Deduplicate case-insensitively
    this.searchHistory = [cityName, ...this.searchHistory.filter(c => c.toLowerCase() !== cityName.toLowerCase())].slice(0, 8);

    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(this.searchHistory));
    } catch (e) {}

    this.ui.renderHistoryPills(this.searchHistory);
  }

  /**
   * Unit Preference Persistence
   */
  loadSavedUnit() {
    try {
      return localStorage.getItem(UNIT_STORAGE_KEY) || 'C';
    } catch (e) {
      return 'C';
    }
  }

  saveUnitPreference(unit) {
    try {
      localStorage.setItem(UNIT_STORAGE_KEY, unit);
    } catch (e) {}
  }

  updateUnitButtonDisplay() {
    if (this.unitToggleBtn) {
      this.unitToggleBtn.textContent = `°${this.currentUnit === 'C' ? 'F' : 'C'}`;
      this.unitToggleBtn.title = `Switch to °${this.currentUnit === 'C' ? 'Fahrenheit' : 'Celsius'}`;
      this.unitToggleBtn.setAttribute('aria-label', `Switch temperature units to °${this.currentUnit === 'C' ? 'Fahrenheit' : 'Celsius'}`);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.weatherApp = new WeatherApp();
});
