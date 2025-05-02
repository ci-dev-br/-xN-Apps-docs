import { ApiProperty } from "@nestjs/swagger";

export class VideoGetInput {
    @ApiProperty({ nullable: true, required: false }) range: string;
    @ApiProperty({ nullable: true, required: false }) videoPath: string;
}