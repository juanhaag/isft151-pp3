import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Report } from './Report';
import { Spot } from './Spot';

@Entity('report_embeddings')
@Index('idx_report_embeddings_spot_id', ['spot_id'])
@Index('idx_report_embeddings_date', ['conditions_date'])
export class ReportEmbedding {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'report_id', type: 'uuid', unique: true })
  report_id!: string;

  @ManyToOne(() => Report, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report!: Report;

  @Column({ name: 'spot_id', type: 'varchar', length: 50 })
  spot_id!: string;

  @ManyToOne(() => Spot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spot_id' })
  spot!: Spot;

  // Vector embedding - TypeORM no soporta el tipo 'vector' directamente
  @Column({ name: 'weather_embedding', type: 'text', nullable: true })
  weather_embedding?: string;

  @Column({ name: 'wave_height_avg', type: 'decimal', precision: 5, scale: 2, nullable: true })
  wave_height_avg?: number;

  @Column({ name: 'wave_period_avg', type: 'decimal', precision: 5, scale: 2, nullable: true })
  wave_period_avg?: number;

  @Column({ name: 'wind_speed_avg', type: 'decimal', precision: 5, scale: 2, nullable: true })
  wind_speed_avg?: number;

  @Column({ name: 'wind_direction', type: 'varchar', length: 50, nullable: true })
  wind_direction?: string;

  @Column({ name: 'swell_direction', type: 'varchar', length: 50, nullable: true })
  swell_direction?: string;

  @Column({ name: 'tide_state', type: 'varchar', length: 50, nullable: true })
  tide_state?: string;

  @Column({ name: 'avg_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  avg_rating?: number;

  @Column({ name: 'total_feedback_count', type: 'int', default: 0 })
  total_feedback_count!: number;

  @Column({ name: 'conditions_date', type: 'date' })
  conditions_date!: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  // Helper para convertir el vector a array
  getEmbeddingArray(): number[] | null {
    if (!this.weather_embedding) return null;
    const cleaned = this.weather_embedding.replace(/[\[\]]/g, '');
    return cleaned.split(',').map(Number);
  }

  // Helper para establecer el vector desde un array
  setEmbeddingArray(embedding: number[]): void {
    this.weather_embedding = `[${embedding.join(',')  }]`;
  }
}
