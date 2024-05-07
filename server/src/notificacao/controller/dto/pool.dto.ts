import { ApiProperty } from "@nestjs/swagger";

export class PoolDto {
    @ApiProperty({ isArray: true })
    messages?: String[];
}