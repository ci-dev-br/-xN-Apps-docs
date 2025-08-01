import { ApiProperty } from "@nestjs/swagger";
export class ContactFindInput {
    @ApiProperty({
        description: 'Pesquisa',
    })
    query?: string;
}