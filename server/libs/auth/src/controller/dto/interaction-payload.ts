import { ApiProperty } from "@nestjs/swagger";

export class InteractionPayload {
    @ApiProperty({ nullable: true }) objectInteracionIdentification?: string;
    @ApiProperty({ nullable: true }) momentum?: Date;
    @ApiProperty({ nullable: true }) tag?: string;
}