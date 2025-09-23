import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Zone } from './Zone';
import { Report } from './Report';

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

  @Column({ type: 'integer' })
  zona_id!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Zone, zone => zone.spots)
  @JoinColumn({ name: 'zona_id' })
  zone!: Zone;

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