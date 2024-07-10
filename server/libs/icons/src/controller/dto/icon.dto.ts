import { ApiProperty } from "@nestjs/swagger";

export class IconGetInput {
    @ApiProperty({ nullable: true, isArray: true }) icons: string[];
}