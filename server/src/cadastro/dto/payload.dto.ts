import { ApiProperty } from "@nestjs/swagger";

/**
 *  Dto data Payload Base
 */
export class Payload<T> {
    @ApiProperty({ nullable: true, required: false })
    data?: T;
    @ApiProperty({ nullable: true, required: false })
    fields?: string[];
    @ApiProperty({ nullable: true, required: false })
    by?: string;
    @ApiProperty({ nullable: true, required: false })
    equals?: string;
}