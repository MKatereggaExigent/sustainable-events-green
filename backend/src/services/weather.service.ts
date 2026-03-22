import axios from 'axios';
import logger from '../utils/logger';

interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    weather: string;
    description: string;
    icon: string;
  };
  forecast?: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    weather: string;
    description: string;
    precipitation_probability: number;
  }>;
}

interface ClimateImpactAnalysis {
  temperature_impact: {
    current_temp: number;
    optimal_range: { min: number; max: number };
    impact_level: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
  weather_risks: {
    precipitation_risk: 'low' | 'medium' | 'high';
    wind_risk: 'low' | 'medium' | 'high';
    extreme_weather_alerts: string[];
  };
  sustainability_factors: {
    outdoor_suitability: number; // 0-100
    energy_efficiency_potential: number; // 0-100
    carbon_impact_modifier: number; // multiplier for carbon calculations
  };
}

class WeatherService {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    this.endpoint = process.env.OPENWEATHER_API_ENDPOINT || 'https://api.openweathermap.org/data/2.5';

    if (!this.apiKey) {
      logger.warn('OpenWeather API key not configured. Weather features will be disabled.');
    }
  }

  /**
   * Check if OpenWeather is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get current weather for a location
   */
  async getCurrentWeather(location: string): Promise<WeatherData> {
    if (!this.isConfigured()) {
      throw new Error('OpenWeather API is not configured');
    }

    try {
      const response = await axios.get(`${this.endpoint}/weather`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric',
        },
      });

      const data = response.data;

      return {
        location: {
          name: data.name,
          country: data.sys.country,
          lat: data.coord.lat,
          lon: data.coord.lon,
        },
        current: {
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          wind_speed: data.wind.speed,
          weather: data.weather[0].main,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
        },
      };
    } catch (error: any) {
      logger.error('OpenWeather request failed', {
        error: error.message,
        location,
      });
      throw new Error(`Weather data fetch failed: ${error.message}`);
    }
  }

  /**
   * Get weather forecast for a location
   */
  async getForecast(location: string, days: number = 5): Promise<WeatherData> {
    if (!this.isConfigured()) {
      throw new Error('OpenWeather API is not configured');
    }

    try {
      // Get current weather
      const current = await this.getCurrentWeather(location);

      // Get forecast
      const forecastResponse = await axios.get(`${this.endpoint}/forecast`, {
        params: {
          q: location,
          appid: this.apiKey,
          units: 'metric',
          cnt: days * 8, // 8 forecasts per day (3-hour intervals)
        },
      });

      const forecastData = forecastResponse.data.list;
      
      // Group by day and get daily summary
      const dailyForecasts = this.groupForecastByDay(forecastData, days);

      return {
        ...current,
        forecast: dailyForecasts,
      };
    } catch (error: any) {
      logger.error('Weather forecast fetch failed', {
        error: error.message,
        location,
      });
      throw new Error(`Weather forecast fetch failed: ${error.message}`);
    }
  }

  /**
   * Group forecast data by day
   */
  private groupForecastByDay(forecastList: any[], days: number): any[] {
    const dailyData: any[] = [];
    const processedDays = new Set<string>();

    for (const item of forecastList) {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      if (!processedDays.has(date) && dailyData.length < days) {
        processedDays.add(date);
        dailyData.push({
          date,
          temp_max: item.main.temp_max,
          temp_min: item.main.temp_min,
          weather: item.weather[0].main,
          description: item.weather[0].description,
          precipitation_probability: item.pop * 100,
        });
      }
    }

    return dailyData;
  }
}

export default new WeatherService();

