import { ApiProperty } from "@nestjs/swagger";

export class InformacaoContatoCotrollerGetInputDto {
    @ApiProperty({ nullable: true, required: false })
    query?: string;
    @ApiProperty({ nullable: true, required: false })
    limit?: number;
}
