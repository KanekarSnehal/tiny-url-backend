import { Url } from "src/url/url.enttity";
import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class QrCode {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    public url_id: string;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: string;

    @Column()
    public created_by: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    public creater: User;

    @OneToOne(() => Url)
    @JoinColumn({ name: 'url_id' })
    public url: Url;
}