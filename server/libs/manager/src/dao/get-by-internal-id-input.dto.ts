import { ApiProperty } from "@nestjs/swagger";

export class GetByInternalIdInputDto {
    @ApiProperty({ nullable: true, required: false })
    internalId?: string;
}