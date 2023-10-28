import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Photo {
    @ApiProperty({})
    @PrimaryColumn('uuid')
    id?: string;
    originalFile: any;
}