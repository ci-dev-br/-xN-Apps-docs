import { ApiProperty } from "@nestjs/swagger";

export class ReadDirectoryInput {
    @ApiProperty({ nullable: true, required: false }) path?: string;
}