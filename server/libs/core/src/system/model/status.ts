import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    schema: 'sys'
})
export class Status {
    @PrimaryGeneratedColumn('increment')
    id: number;
    @Column({ nullable: true })
    memory?: number;
    @CreateDateColumn()
    createdAt?: Date;
}