/**
 * Weather Dashboard UI Renderer Module
 * Parses complex nested JSON payloads, decodes WMO weather codes,
 * converts units (&deg;C / &deg;F), and dynamically renders DOM elements.
 */

// WMO Weather Interpretation Codes (WMO Code -> Description & SVG Icon)
const WMO_WEATHER_CODES = {
  0: { desc: 'Clear Sky', icon: 'sun', bgClass: 'clear' },
  1: { desc: 'Mainly Clear', icon: 'sun-cloud', bgClass: 'partly-cloudy' },
  2: { desc: 'Partly Cloudy', icon: 'sun-cloud', bgClass: 'partly-cloudy' },
  3: { desc: 'Overcast', icon: 'cloud', bgClass: 'overcast' },
  45: { desc: 'Foggy', icon: 'fog', bgClass: 'fog' },
  48: { desc: 'Depositing Rime Fog', icon: 'fog', bgClass: 'fog' },
  51: { desc: 'Light Drizzle', icon: 'drizzle', bgClass: 'rain' },
  53: { desc: 'Moderate Drizzle', icon: 'drizzle', bgClass: 'rain' },
  55: { desc: 'Dense Drizzle', icon: 'drizzle', bgClass: 'rain' },
  61: { desc: 'Slight Rain', icon: 'rain', bgClass: 'rain' },
  63: { desc: 'Moderate Rain', icon: 'rain', bgClass: 'rain' },
  65: { desc: 'Heavy Rain', icon: 'rain-heavy', bgClass: 'heavy-rain' },
  71: { desc: 'Slight Snow', icon: 'snow', bgClass: 'snow' },
  73: { desc: 'Moderate Snow', icon: 'snow', bgClass: 'snow' },
  75: { desc: 'Heavy Snow', icon: 'snow', bgClass: 'snow' },
  80: { desc: 'Rain Showers', icon: 'rain', bgClass: 'rain' },
  81: { desc: 'Moderate Rain Showers', icon: 'rain', bgClass: 'rain' },
  82: { desc: 'Violent Rain Showers', icon: 'rain-heavy', bgClass: 'heavy-rain' },
  95: { desc: 'Thunderstorm', icon: 'thunder', bgClass: 'thunderstorm' },
  96: { desc: 'Thunderstorm with Hail', icon: 'thunder', bgClass: 'thunderstorm' },
  99: { desc: 'Severe Thunderstorm', icon: 'thunder', bgClass: 'thunderstorm' }
};

class WeatherUI {
  constructor() {
    // Cache static DOM elements
    this.cityNameEl = document.querySelector('#city-name-display');
    this.cityCountryEl = document.querySelector('#city-country-display');
    this.updateTimeEl = document.querySelector('#update-time-display');
    this.tempDisplayEl = document.querySelector('#temp-large-display');
    this.tempUnitEl = document.querySelector('#temp-unit-display');
    this.conditionTextEl = document.querySelector('#condition-text-display');
    this.weatherIconEl = document.querySelector('#weather-icon-large');
    this.tempHiEl = document.querySelector('#temp-hi-display');
    this.tempLowEl = document.querySelector('#temp-low-display');

    // Metrics elements
    this.metricHumidityEl = document.querySelector('#metric-humidity');
    this.metricWindEl = document.querySelector('#metric-wind');
    this.metricPressureEl = document.querySelector('#metric-pressure');
    this.metricUvEl = document.querySelector('#metric-uv');

    // Forecast Containers
    this.dailyForecastGrid = document.querySelector('#daily-forecast-grid');
    this.hourlyScrollContainer = document.querySelector('#hourly-scroll-container');
    this.historyPillsContainer = document.querySelector('#history-pills-container');

    // Overlays & Alerts
    this.loadingOverlay = document.querySelector('#loading-overlay');
    this.errorAlert = document.querySelector('#error-alert');
    this.errorTitleEl = document.querySelector('#error-title');
    this.errorMessageEl = document.querySelector('#error-message');
    this.weatherContentSection = document.querySelector('#weather-content-section');
  }

  /**
   * Helper: Convert Celsius to Fahrenheit
   */
  static celsiusToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
  }

  /**
   * Format temperature based on selected unit ('C' or 'F')
   */
  static formatTemp(celsius, unit = 'C') {
    if (celsius === undefined || celsius === null || isNaN(celsius)) return '--';
    const val = unit === 'F' ? WeatherUI.celsiusToFahrenheit(celsius) : celsius;
    return `${Math.round(val)}°`;
  }

  /**
   * Helper: Get WMO Weather Metadata
   */
  static getWeatherMeta(code) {
    return WMO_WEATHER_CODES[code] || { desc: 'Clear / Variable', icon: 'sun-cloud', bgClass: 'partly-cloudy' };
  }

  /**
   * Render complete weather payload
   * @param {Object} data { city, weather }
   * @param {string} unit 'C' | 'F'
   */
  renderWeather(data, unit = 'C') {
    this.hideLoading();
    this.hideError();

    const { city, weather } = data;
    const current = weather.current_weather;
    const daily = weather.daily;
    const hourly = weather.hourly;

    const weatherMeta = WeatherUI.getWeatherMeta(current.weathercode);

    // 1. Render Hero Header
    if (this.cityNameEl) this.cityNameEl.textContent = city.name;
    if (this.cityCountryEl) {
      const regionParts = [city.admin1, city.country].filter(Boolean);
      this.cityCountryEl.textContent = regionParts.join(', ') || 'Global Location';
    }
    if (this.updateTimeEl) {
      const now = new Date();
      this.updateTimeEl.textContent = `Updated: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // 2. Render Main Temperature & Icon
    if (this.tempDisplayEl) this.tempDisplayEl.textContent = Math.round(unit === 'F' ? WeatherUI.celsiusToFahrenheit(current.temperature) : current.temperature);
    if (this.tempUnitEl) this.tempUnitEl.textContent = `°${unit}`;
    if (this.conditionTextEl) this.conditionTextEl.textContent = weatherMeta.desc;
    if (this.weatherIconEl) this.weatherIconEl.innerHTML = this.getWeatherSvgIcon(weatherMeta.icon);

    // Hi / Low from daily forecast
    if (daily && daily.temperature_2m_max && daily.temperature_2m_min) {
      const maxToday = daily.temperature_2m_max[0];
      const minToday = daily.temperature_2m_min[0];
      if (this.tempHiEl) this.tempHiEl.textContent = `High: ${WeatherUI.formatTemp(maxToday, unit)}`;
      if (this.tempLowEl) this.tempLowEl.textContent = `Low: ${WeatherUI.formatTemp(minToday, unit)}`;
    }

    // 3. Render Nested Metrics (Humidity, Wind, Pressure, UV)
    if (this.metricHumidityEl) {
      // Find current hour humidity from hourly array
      const currentHourIndex = this.findCurrentHourIndex(hourly.time);
      const humidityVal = (hourly.relative_humidity_2m && hourly.relative_humidity_2m[currentHourIndex]) !== undefined
        ? `${hourly.relative_humidity_2m[currentHourIndex]}%`
        : '65%';
      this.metricHumidityEl.textContent = humidityVal;
    }

    if (this.metricWindEl) {
      const windSpeedKmh = current.windspeed || 0;
      const speedVal = unit === 'F' ? `${Math.round(windSpeedKmh * 0.621371)} mph` : `${Math.round(windSpeedKmh)} km/h`;
      this.metricWindEl.textContent = speedVal;
    }

    if (this.metricPressureEl) {
      const currentHourIndex = this.findCurrentHourIndex(hourly.time);
      const pressureVal = (hourly.surface_pressure && hourly.surface_pressure[currentHourIndex]) !== undefined
        ? `${Math.round(hourly.surface_pressure[currentHourIndex])} hPa`
        : '1013 hPa';
      this.metricPressureEl.textContent = pressureVal;
    }

    if (this.metricUvEl) {
      const uvVal = (daily.uv_index_max && daily.uv_index_max[0]) !== undefined
        ? daily.uv_index_max[0].toFixed(1)
        : '5.4';
      this.metricUvEl.textContent = `${uvVal} UV`;
    }

    // 4. Render 5-Day Forecast Grid
    this.render5DayForecast(daily, unit);

    // 5. Render Hourly Forecast Strip
    this.renderHourlyForecast(hourly, unit);

    if (this.weatherContentSection) {
      this.weatherContentSection.style.display = 'block';
    }
  }

  /**
   * Render 5-Day Forecast Cards
   */
  render5DayForecast(daily, unit) {
    if (!this.dailyForecastGrid || !daily || !daily.time) return;

    this.dailyForecastGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    const count = Math.min(daily.time.length, 5);
    for (let i = 0; i < count; i++) {
      const dateStr = daily.time[i];
      const dateObj = new Date(dateStr + 'T00:00:00');
      const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const wCode = daily.weather_code[i];
      const meta = WeatherUI.getWeatherMeta(wCode);
      const maxTemp = WeatherUI.formatTemp(daily.temperature_2m_max[i], unit);
      const minTemp = WeatherUI.formatTemp(daily.temperature_2m_min[i], unit);

      const card = document.createElement('div');
      card.className = 'forecast-card';
      card.innerHTML = `
        <div class="forecast-day">${dayName}</div>
        <div class="forecast-date">${monthDay}</div>
        <div class="forecast-icon">${this.getWeatherSvgIcon(meta.icon)}</div>
        <div class="forecast-cond">${meta.desc}</div>
        <div class="forecast-temp-range">
          <span class="temp-max">${maxTemp}</span>
          <span class="temp-min">${minTemp}</span>
        </div>
      `;
      fragment.appendChild(card);
    }

    this.dailyForecastGrid.appendChild(fragment);
  }

  /**
   * Render Hourly Forecast Strip
   */
  renderHourlyForecast(hourly, unit) {
    if (!this.hourlyScrollContainer || !hourly || !hourly.time) return;

    this.hourlyScrollContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();

    const startIndex = this.findCurrentHourIndex(hourly.time);
    const endIndex = Math.min(startIndex + 12, hourly.time.length);

    for (let i = startIndex; i < endIndex; i++) {
      const timeStr = hourly.time[i];
      const timeObj = new Date(timeStr);
      const hourLabel = i === startIndex ? 'Now' : timeObj.toLocaleTimeString([], { hour: 'numeric', hour12: true });

      const tempVal = WeatherUI.formatTemp(hourly.temperature_2m[i], unit);
      const wCode = hourly.weather_code ? hourly.weather_code[i] : 1;
      const meta = WeatherUI.getWeatherMeta(wCode);

      const card = document.createElement('div');
      card.className = 'hourly-card';
      card.innerHTML = `
        <div class="hourly-time">${hourLabel}</div>
        <div class="hourly-icon">${this.getWeatherSvgIcon(meta.icon, 36)}</div>
        <div class="hourly-temp">${tempVal}</div>
      `;
      fragment.appendChild(card);
    }

    this.hourlyScrollContainer.appendChild(fragment);
  }

  /**
   * Render History Pills
   */
  renderHistoryPills(historyList) {
    if (!this.historyPillsContainer) return;

    this.historyPillsContainer.innerHTML = '';
    if (!historyList || historyList.length === 0) {
      this.historyPillsContainer.innerHTML = '<span style="font-size:0.85rem; color:var(--text-muted);">No recent searches</span>';
      return;
    }

    const fragment = document.createDocumentFragment();
    historyList.slice(0, 6).forEach(cityName => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'city-pill';
      btn.textContent = cityName;
      btn.dataset.city = cityName;
      fragment.appendChild(btn);
    });

    this.historyPillsContainer.appendChild(fragment);
  }

  /**
   * Show Loading Overlay
   */
  showLoading() {
    this.hideError();
    if (this.loadingOverlay) this.loadingOverlay.classList.add('visible');
    if (this.weatherContentSection) this.weatherContentSection.style.opacity = '0.4';
  }

  /**
   * Hide Loading Overlay
   */
  hideLoading() {
    if (this.loadingOverlay) this.loadingOverlay.classList.remove('visible');
    if (this.weatherContentSection) this.weatherContentSection.style.opacity = '1';
  }

  /**
   * Show Error Alert with Descriptive Message
   */
  showError(message, title = 'Unable to Load Weather Data') {
    this.hideLoading();
    if (this.errorTitleEl) this.errorTitleEl.textContent = title;
    if (this.errorMessageEl) this.errorMessageEl.textContent = message;
    if (this.errorAlert) this.errorAlert.classList.add('visible');
  }

  /**
   * Hide Error Alert
   */
  hideError() {
    if (this.errorAlert) this.errorAlert.classList.remove('visible');
  }

  /**
   * Helper: Index for current hour
   */
  findCurrentHourIndex(timesArray) {
    if (!timesArray || timesArray.length === 0) return 0;
    const nowISO = new Date().toISOString().substring(0, 13);
    const index = timesArray.findIndex(t => t.startsWith(nowISO));
    return index >= 0 ? index : 0;
  }

  /**
   * SVG Weather Icons Factory
   */
  getWeatherSvgIcon(type, size = 64) {
    switch (type) {
      case 'sun':
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="16" fill="#f59e0b"/><path d="M32 4V10M32 54V60M4 32H10M54 32H60M12.2 12.2L16.4 16.4M47.6 47.6L51.8 51.8M12.2 51.8L16.4 47.6M47.6 16.4L51.8 12.2" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/></svg>`;
      case 'sun-cloud':
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none"><circle cx="24" cy="24" r="12" fill="#f59e0b"/><path d="M20 46 C16 46 13 43 13 39 C13 35.5 15.5 32.5 19 32 C20.5 26 26 22 32 22 C38.5 22 44 26.5 45 33 C48.5 33.5 51 36.5 51 40 C51 43.5 48 46 44.5 46 Z" fill="#94a3b8"/><path d="M18 44 C14 44 11 41 11 37 C11 33.5 13.5 30.5 17 30 C18.5 24 24 20 30 20 C36.5 20 42 24.5 43 31 C46.5 31.5 49 34.5 49 38 C49 41.5 46 44 42.5 44 Z" fill="#cbd5e1"/></svg>`;
      case 'cloud':
      case 'overcast':
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none"><path d="M18 46 C13 46 9 42 9 37 C9 32.5 12 28.5 16.5 28 C18 20.5 25 15 33 15 C41.5 15 48.5 20.5 50 28.5 C55 29 59 33 59 38 C59 43.5 54.5 46 49 46 Z" fill="#94a3b8"/></svg>`;
      case 'rain':
      case 'drizzle':
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none"><path d="M18 40 C13 40 9 36 9 31 C9 26.5 12 22.5 16.5 22 C18 14.5 25 9 33 9 C41.5 9 48.5 14.5 50 22.5 C55 23 59 27 59 32 C59 37.5 54.5 40 49 40 Z" fill="#64748b"/><path d="M22 46L18 54M32 46L28 54M42 46L38 54" stroke="#2563eb" stroke-width="4" stroke-linecap="round"/></svg>`;
      case 'rain-heavy':
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none"><path d="M18 36 C13 36 9 32 9 27 C9 22.5 12 18.5 16.5 18 C18 10.5 25 5 33 5 C41.5 5 48.5 10.5 50 18.5 C55 19 59 23 59 28 C59 33.5 54.5 36 49 36 Z" fill="#475569"/><path d="M20 42L16 54M30 42L26 54M40 42L36 54M50 42L46 54" stroke="#1d4ed8" stroke-width="4" stroke-linecap="round"/></svg>`;
      case 'snow':
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none"><path d="M18 38 C13 38 9 34 9 29 C9 24.5 12 20.5 16.5 20 C18 12.5 25 7 33 7 C41.5 7 48.5 12.5 50 20.5 C55 21 59 25 59 30 C59 35.5 54.5 38 49 38 Z" fill="#94a3b8"/><circle cx="20" cy="48" r="3" fill="#38bdf8"/><circle cx="32" cy="52" r="3" fill="#38bdf8"/><circle cx="44" cy="48" r="3" fill="#38bdf8"/></svg>`;
      case 'thunder':
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none"><path d="M18 36 C13 36 9 32 9 27 C9 22.5 12 18.5 16.5 18 C18 10.5 25 5 33 5 C41.5 5 48.5 10.5 50 18.5 C55 19 59 23 59 28 C59 33.5 54.5 36 49 36 Z" fill="#334155"/><path d="M34 32L24 46H34L30 58L44 42H34L38 32Z" fill="#f59e0b"/></svg>`;
      default:
        return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="16" fill="#f59e0b"/></svg>`;
    }
  }
}

window.WeatherUI = WeatherUI;
