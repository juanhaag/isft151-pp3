import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Spot } from './Spot';

export interface BestConditions {
  swell_direction: string[];
  wind_direction: string[];
  tide: string[];
  swell_size: string;
}

@Entity('zones')
export class Zone {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true
  })
  location?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ type: 'jsonb' })
  best_conditions!: BestConditions;

  @Column({ type: 'jsonb', nullable: true })
  bad_conditions?: BestConditions;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Spot, spot => spot.zone)
  spots!: Spot[];

  // Helper method to set location from lat/lon
  setLocationFromCoordinates(longitude: number, latitude: number): void {
    this.location = `POINT(${longitude} ${latitude})`;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  // Helper method to get coordinates from geometry location
  private getCoordinateFromLocation(index: number): number {
    if (typeof this.location === 'string') {
      const match = this.location.match(/POINT\(([^)]+)\)/);
      if (match) {
        const coords = match[1].split(' ');
        return parseFloat(coords[index]);
      }
    }
    return 0;
  }

  // Virtual properties for getting coordinates from geometry if not set directly
  get lat(): number {
    return this.latitude ?? this.getCoordinateFromLocation(1);
  }

  get lon(): number {
    return this.longitude ?? this.getCoordinateFromLocation(0);
  }
}