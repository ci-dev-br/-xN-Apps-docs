import { ApiProperty } from "@nestjs/swagger";

export class DeployPayload {
    @ApiProperty({ nullable: true, required: false }) url_report: string;

}