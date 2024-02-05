import { ApiProperty } from "@nestjs/swagger";

/**
 *  Dto data Payload Base
 */
export class Payload<T> {
    @ApiProperty({ nullable: true, required: false })
    data?: T;
    @ApiProperty({ nullable: true, required: false })
    fields?: string[];
}