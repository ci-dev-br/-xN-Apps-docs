import { ApiProperty } from "@nestjs/swagger";

export class DevicePayload {
    @ApiProperty({ nullable: true, required: false })
    id?: string;
    @ApiProperty({ nullable: true, required: false })
    name?: string;
    @ApiProperty({ nullable: true, required: false })
    applicationId?: string;
    @ApiProperty({ nullable: true, required: false })
    model?: string;
    @ApiProperty({ nullable: true, required: false })
    authentication?: string;
}