import { ApiProperty } from "@nestjs/swagger";

export class DeployPayload {
    @ApiProperty({ nullable: true, required: false }) BUILD_URL?: string;
    @ApiProperty({ nullable: true, required: false }) BUILD_TAG?: string;
}