import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity()
export class Url {
    @PrimaryColumn({ type: 'varchar', length: 7 })
    id: string;

    @Column({ type: 'text', nullable: false })
    long_url: string;

    @Column({ type: 'timestamp', default: () => `CURRENT_TIMESTAMP + INTERVAL '10 years'` })
    expiration: Date;

    @ManyToOne(() => User)
    created_by: User;

    @Column({ type: 'text', nullable: true, default: null })
    custom_back_half: string | null;

    @Column({ type: 'text', nullable: true })
    qr_code: string;
}
