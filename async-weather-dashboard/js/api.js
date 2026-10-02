/**
 * Weather Dashboard REST API Module
 * Fetches real-time JSON data using Fetch API and async/await
 * Public REST Endpoints: Open-Meteo Geocoding & Weather Forecast APIs
 */

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fallback static mock data for core cities in case of network unavailability
 */
const MOCK_WEATHER_DATABASE = {
  'chennai': {
    name: 'Chennai',
    country: 'India',
    admin1: 'Tamil Nadu',
    latitude: 13.0878,
    longitude: 80.2785,
    current_weather: {
      temperature: 32.4,
      windspeed: 14.8,
      winddirection: 110,
      weathercode: 1, // Mainly Clear
      time: new Date().toISOString()
    },
    hourly: {
      time: Array.from({ length: 24 }, (_, i) => new Date(Date.now() + i * 3600000).toISOString()),
      temperature_2m: [30, 29, 28, 28, 27, 28, 30, 32, 34, 35, 34, 33, 32, 31, 30, 30, 29, 29, 28, 28, 28, 29, 29, 30],
      relative_humidity_2m: [75, 78, 80, 82, 85, 80, 72, 65, 60, 58, 62, 68, 72, 75, 78, 80, 82, 82, 80, 78, 76, 75, 75, 75],
      weather_code: Array(24).fill(1),
      surface_pressure: Array(24).fill(1008.5),
      wind_speed_10m: Array(24).fill(14.8)
    },
    daily: {
      time: Array.from({ length: 5 }, (_, i) => new Date(Date.now() + i * 86400000).toISOString().split('T')[0]),
      weather_code: [1, 2, 3, 0, 1],
      temperature_2m_max: [34.5, 33.8, 32.0, 35.0, 34.2],
      temperature_2m_min: [26.2, 25.8, 26.0, 25.5, 26.1],
      uv_index_max: [9.2, 8.5, 7.8, 9.8, 9.1]
    }
  }
};

class WeatherAPI {
  /**
   * Search city coordinates by name via REST API
   * @param {string} query City name
   * @returns {Promise<Object>} Selected city result metadata
   */
  static async searchCity(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      throw new Error('Please enter a city name to search.');
    }

    try {
      const url = `${GEOCODING_API_URL}?name=${encodeURIComponent(trimmed)}&count=5&language=en&format=json`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Geocoding API server error (${response.status}: ${response.statusText})`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        // Check fallback mock DB
        const lower = trimmed.toLowerCase();
        if (MOCK_WEATHER_DATABASE[lower]) {
          return MOCK_WEATHER_DATABASE[lower];
        }
        throw new Error(`No location results found for "${trimmed}". Please check the city spelling.`);
      }

      // Return primary matched result
      const bestMatch = data.results[0];
      return {
        name: bestMatch.name,
        country: bestMatch.country || '',
        admin1: bestMatch.admin1 || '',
        latitude: bestMatch.latitude,
        longitude: bestMatch.longitude
      };
    } catch (err) {
      // Offline fallback handling for Chennai or predefined cities
      const lower = trimmed.toLowerCase();
      if (MOCK_WEATHER_DATABASE[lower]) {
        return MOCK_WEATHER_DATABASE[lower];
      }

      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        throw new Error('Network error: Unable to connect to weather servers. Please check your internet connection.');
      }
      throw err;
    }
  }

  /**
   * Fetch current and forecast weather data by coordinates via REST API
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<Object>} Nested weather JSON payload
   */
  static async fetchWeather(latitude, longitude) {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current_weather: 'true',
        hourly: 'temperature_2m,relative_humidity_2m,weather_code,surface_pressure,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max',
        timezone: 'auto'
      });

      const url = `${WEATHER_API_URL}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather REST API server error (${response.status}: ${response.statusText})`);
      }

      const data = await response.json();

      if (!data.current_weather || !data.daily) {
        throw new Error('Incomplete weather payload received from API server.');
      }

      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        throw new Error('Network error: Failed to fetch live weather data.');
      }
      throw err;
    }
  }

  /**
   * Combined high-level async method: Search city and fetch weather data
   * @param {string} cityName 
   * @returns {Promise<Object>} Formatted combined result
   */
  static async getWeatherByCity(cityName) {
    // 1. Search city REST endpoint
    const cityInfo = await WeatherAPI.searchCity(cityName);

    // If cityInfo is already mock fallback containing full weather, return directly
    if (cityInfo.current_weather && cityInfo.daily) {
      return {
        city: cityInfo,
        weather: cityInfo
      };
    }

    // 2. Fetch live forecast REST endpoint
    const weatherData = await WeatherAPI.fetchWeather(cityInfo.latitude, cityInfo.longitude);

    return {
      city: cityInfo,
      weather: weatherData
    };
  }
}

window.WeatherAPI = WeatherAPI;
