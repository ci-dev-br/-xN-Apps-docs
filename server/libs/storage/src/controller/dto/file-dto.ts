import { ApiProperty } from "@nestjs/swagger";

export class FileDto {
    @ApiProperty({ nullable: true, required: false })
    path?: string;
    @ApiProperty({ nullable: true, required: false })
    encoding?: string;
    @ApiProperty({ nullable: true, required: false })
    data?: any;
    @ApiProperty({ nullable: true, required: false })
    gitStatus?: any;
}