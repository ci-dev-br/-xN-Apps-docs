import { ApiProperty } from "@nestjs/swagger";

export class GetDeviceInput {
    @ApiProperty({ nullable: true, required: false }) query?: string;
}