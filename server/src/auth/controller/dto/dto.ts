import { ApiProperty } from "@nestjs/swagger";

export class RegistrarInputDto {
    @ApiProperty({ required: false })
    identificacao?: string;
    @ApiProperty({ required: false })
    email?: string;
    @ApiProperty({ required: false })
    password?: string;
    @ApiProperty({ required: false })
    phone?: string;
}