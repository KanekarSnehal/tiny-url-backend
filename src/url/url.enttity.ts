import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity()
export class Url {
    @PrimaryColumn({ type: 'varchar', length: 7 })
    id: string;

    @Column({ type: 'text', nullable: false })
    long_url: string;

    @Column({ type: 'timestamp', default: () => `CURRENT_TIMESTAMP + INTERVAL '10 years'` })
    expiration: Date;

    @Column()
    public created_by: number;

    @Column({ type: 'text', nullable: true, default: null })
    custom_back_half: string | null;

    @Column({ type: 'text', nullable: true })
    qr_code: string;

    @Column({ type: 'text', nullable: true })
    title: string;

    @Column({ type: 'varchar', nullable: true, default: null })
    custom_domain: string | null;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: string

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    public creater: User;
}
