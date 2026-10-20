import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { schema } from "./schema";

@Entity({ schema })
export class WebPushSubscription {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty()
    id!: string;

    @Column()
    @Index()
    @ApiProperty({ description: 'ID do usuário proprietário da inscrição de Push' })
    userId!: string;

    @Column({ type: 'text' })
    @ApiProperty({ description: 'Endpoint de push do navegador' })
    endpoint!: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty({ required: false, nullable: true })
    p256dh?: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty({ required: false, nullable: true })
    auth?: string;

    @Column({ nullable: true })
    @ApiProperty({ required: false, nullable: true })
    userAgent?: string;

    @CreateDateColumn()
    @ApiProperty()
    createdAt!: Date;
}
