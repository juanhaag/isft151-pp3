export interface Point {
  latitude: number;
  longitude: number;
}

export interface BestConditions {
  swell_direction?: string[];
  wind_direction?: string[];
  wave_type?: string[];
  wave_direction?: string[];
  tide?: string[];
  notes?: string;
}

export interface BadConditions {
  swell_direction?: string[];
  wind_direction?: string[];
  notes?: string;
}

export interface Spot {
  place_id: string;
  location: string;
  display_name: string;
  zona: string;
  best_conditions: BestConditions;
  bad_conditions?: BadConditions;
  latitude?: number;
  longitude?: number;
}

export interface WeatherData {
  wave_height: number[];
  wave_direction: number[];
  wave_period: number[];
  swell_wave_height: number[];
  swell_wave_direction: number[];
  swell_wave_period: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  time: string[];
}

export interface Report {
  id: string;
  spot_id: string;
  report_text: string;
  weather_data: WeatherData;
  user_preferences?: string;
  created_at: Date;
  updated_at: Date;
}

/////////// USer

export interface IUser {
  id?: number;
  username: string;
  email: string;
  password: string;
  phone?: string;
  created_at?: Date;
  updated_at?: Date;
}