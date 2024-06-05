import { ApiProperty } from "@nestjs/swagger";

/**
 * Payload de Mensagem Direta
 */
export class MessagePayload {
    @ApiProperty({}) content?: string;
    @ApiProperty({}) format?: string;
    @ApiProperty({}) to?: string;
}