import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Photo {
    @ApiProperty({})
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @ApiProperty({})
    @Column({ type: 'bytea' })
    originalFile?: any;
}