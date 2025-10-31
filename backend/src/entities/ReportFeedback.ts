import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Report } from './Report';
import { User } from './User';

@Entity('report_feedback')
export class ReportFeedback {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'report_id', type: 'uuid' })
  report_id!: string;

  @ManyToOne(() => Report, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report!: Report;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  user_id?: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ name: 'weather_accuracy_rating', type: 'int', nullable: true })
  weather_accuracy_rating?: number;

  @Column({ name: 'recommendation_helpfulness', type: 'int', nullable: true })
  recommendation_helpfulness?: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
