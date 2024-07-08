import { ApiProperty } from "@nestjs/swagger";

export class GetInputDtos {
    @ApiProperty({ nullable: true, required: false })
    all?: boolean;
}