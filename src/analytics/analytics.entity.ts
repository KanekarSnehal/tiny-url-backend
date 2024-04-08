import { QrCode } from "src/qr-code/qr-code.enitity";
import { Url } from "src/url/url.enttity";
import { PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Entity } from "typeorm";

@Entity()
export class Analytics {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    analytical_type: string;

    @Column({ nullable: true })
    url_id: string;

    @Column({ nullable: true })
    qr_code_id: string;

    @Column()
    country: string;

    @Column()
    city: string;

    @Column()
    device_type: string;

    @Column()
    browser: string;

    @Column()
    os: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: string;

    @ManyToOne(() => Url)
    @JoinColumn({ name: 'url_id' })
    public url: Url;

    @ManyToOne(() => QrCode)
    @JoinColumn({ name: 'qr_code_id' })
    public qr_code: QrCode;
}