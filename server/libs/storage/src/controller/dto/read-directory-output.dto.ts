import { ApiProperty } from "@nestjs/swagger";

export class ReadDirectoryOutput {
    @ApiProperty({ nullable: true, required: false }) path?: string;
    @ApiProperty({ nullable: true, required: false }) name?: string;
    @ApiProperty({ nullable: true, required: false }) isFile?: boolean;
    @ApiProperty({ nullable: true, required: false }) isDirectory?: boolean;
    @ApiProperty({ nullable: true, required: false }) isSocket?: boolean;
    @ApiProperty({ nullable: true, required: false }) isFIFO?: boolean;
    @ApiProperty({ nullable: true, required: false }) isSymbolicLink?: boolean;
}