import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { schema } from "./schema";
import { User } from "./user.entity";
import { ApiProperty } from "@nestjs/swagger";


@Entity({ schema })
export class UserPreference {
    @ApiProperty({
        title: 'User ID'
    })
    @PrimaryColumn()
    userId?: string;
    @ApiProperty({
        title: 'Usuário',
        type: User,
    })
    @JoinColumn({ name: "userId", })
    @ManyToOne(() => User, (user) => user.preferences, {
        lazy: true,
        createForeignKeyConstraints: true,
        onDelete: 'CASCADE',
    })
    user?: User;
    @PrimaryColumn()
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    code?: string;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    value?: string;
}