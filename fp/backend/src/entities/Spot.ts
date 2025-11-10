import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Report } from './Report';

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

@Entity('spots')
export class Spot {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  place_id!: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326
  })
  location!: string;

  @Column({ type: 'text' })
  display_name!: string;

  @Column({ type: 'varchar', length: 255 })
  zona!: string;

  @Column({ type: 'jsonb' })
  best_conditions!: BestConditions;

  @Column({ type: 'jsonb', nullable: true })
  bad_conditions?: BadConditions;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Report, report => report.spot)
  reports!: Report[];

  // Virtual properties for latitude and longitude
  get latitude(): number {
    return this.getCoordinateFromLocation(1);
  }

  get longitude(): number {
    return this.getCoordinateFromLocation(0);
  }

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

  // Helper method to set location from lat/lon
  setLocationFromCoordinates(longitude: number, latitude: number): void {
    this.location = `POINT(${longitude} ${latitude})`;
  }
}