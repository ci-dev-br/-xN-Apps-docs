import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({
    schema: 'authentication'
})
export class AccessCredential {
    @ApiProperty({ required: false, nullable: true })
    @PrimaryGeneratedColumn('uuid')
    id?: string;
    @Column({ nullable: false })
    userIdentification: string;
    @Column({ nullable: false })
    createdAt?: Date;
    @Column({ nullable: false })
    modifiedAt?: Date;
    @Column({ nullable: false })
    operable?: Boolean;
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    refreshToken?: string;
}