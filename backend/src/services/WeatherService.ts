import axios from 'axios';
import { WeatherData, Point } from '../types';

export interface MarineResponse {
  hourly: {
    time: string[];
    wave_height: number[];
    wave_direction: number[];
    wave_period: number[];
    swell_wave_height: number[];
    swell_wave_direction: number[];
    swell_wave_period: number[];
  };
}

export interface MeteoResponse {
  hourly: {
    time: string[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
  };
}

export class WeatherService {
  private static readonly MARINE_BASE_URL = 'https://marine-api.open-meteo.com/v1/marine';
  private static readonly METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

  async getWeatherData(location: Point, forecastDays: number = 7): Promise<WeatherData> {
    try {
      const [marineData, meteoData] = await Promise.all([
        this.getMarineData(location, forecastDays),
        this.getMeteoData(location, forecastDays)
      ]);

      return this.mergeWeatherData(marineData, meteoData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data from Open Meteo');
    }
  }

  private async getMarineData(location: Point, forecastDays: number): Promise<MarineResponse> {
    const url = `${WeatherService.MARINE_BASE_URL}?latitude=${location.latitude}&longitude=${location.longitude}&hourly=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&forecast_days=${forecastDays}&timezone=auto`;

    const response = await axios.get<MarineResponse>(url);
    return response.data;
  }

  private async getMeteoData(location: Point, forecastDays: number): Promise<MeteoResponse> {
    const url = `${WeatherService.METEO_BASE_URL}?latitude=${location.latitude}&longitude=${location.longitude}&hourly=wind_speed_10m,wind_direction_10m&forecast_days=${forecastDays}&timezone=auto`;

    const response = await axios.get<MeteoResponse>(url);
    return response.data;
  }

  private mergeWeatherData(marineData: MarineResponse, meteoData: MeteoResponse): WeatherData {
    const marine = marineData.hourly;
    const meteo = meteoData.hourly;

    return {
      time: marine.time,
      wave_height: marine.wave_height,
      wave_direction: marine.wave_direction,
      wave_period: marine.wave_period,
      swell_wave_height: marine.swell_wave_height,
      swell_wave_direction: marine.swell_wave_direction,
      swell_wave_period: marine.swell_wave_period,
      wind_speed_10m: meteo.wind_speed_10m,
      wind_direction_10m: meteo.wind_direction_10m
    };
  }

  processWeatherData(weatherData: WeatherData): any {
    const processedData = {
      forecast: [] as any[],
      summary: {
        avgWaveHeight: 0,
        maxWaveHeight: 0,
        avgSwellHeight: 0,
        maxSwellHeight: 0,
        avgWindSpeed: 0,
        maxWindSpeed: 0
      }
    };

    const length = weatherData.time.length;
    let totalWaveHeight = 0;
    let totalSwellHeight = 0;
    let totalWindSpeed = 0;
    let maxWave = 0;
    let maxSwell = 0;
    let maxWind = 0;

    for (let i = 0; i < length; i++) {
      const waveHeight = weatherData.wave_height[i] || 0;
      const swellHeight = weatherData.swell_wave_height[i] || 0;
      const windSpeed = weatherData.wind_speed_10m[i] || 0;

      totalWaveHeight += waveHeight;
      totalSwellHeight += swellHeight;
      totalWindSpeed += windSpeed;

      maxWave = Math.max(maxWave, waveHeight);
      maxSwell = Math.max(maxSwell, swellHeight);
      maxWind = Math.max(maxWind, windSpeed);

      processedData.forecast.push({
        time: weatherData.time[i],
        waveHeight,
        waveDirection: weatherData.wave_direction[i],
        wavePeriod: weatherData.wave_period[i],
        swellHeight,
        swellDirection: weatherData.swell_wave_direction[i],
        swellPeriod: weatherData.swell_wave_period[i],
        windSpeed,
        windDirection: weatherData.wind_direction_10m[i]
      });
    }

    processedData.summary = {
      avgWaveHeight: totalWaveHeight / length,
      maxWaveHeight: maxWave,
      avgSwellHeight: totalSwellHeight / length,
      maxSwellHeight: maxSwell,
      avgWindSpeed: totalWindSpeed / length,
      maxWindSpeed: maxWind
    };

    return processedData;
  }
}