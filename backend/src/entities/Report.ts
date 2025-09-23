import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Spot } from './Spot';

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

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  spot_id!: string;

  @Column({ type: 'text' })
  report_text!: string;

  @Column({ type: 'jsonb' })
  weather_data!: WeatherData;

  @Column({ type: 'text', nullable: true })
  user_preferences?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Spot, spot => spot.reports)
  @JoinColumn({ name: 'spot_id' })
  spot!: Spot;
}