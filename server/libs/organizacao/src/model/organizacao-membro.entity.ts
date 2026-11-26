import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/core";
import { Column, Entity } from "typeorm";
import { schema } from "./schema";

export type OrganizacaoMembroStatus = 'ACTIVE' | 'INVITED' | 'REMOVED';

/**
 * Vínculo de usuário com uma Organização e seu respectivo Tenant,
 * armazenando os roles específicos da organização (prefixo ORG).
 */
@Entity({ schema })
export class OrganizacaoMembro extends FullAuditedEntity {
    @ApiProperty({ description: 'ID interno da Organização' })
    @Column()
    organizacaoId: string;

    @ApiProperty({ description: 'ID do Tenant da Organização' })
    @Column()
    tenantId: string;

    @ApiProperty({ description: 'ID do usuário membro' })
    @Column()
    userId: string;

    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    userEmail?: string;

    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    userName?: string;

    @ApiProperty({ default: false })
    @Column({ default: false })
    isOwner?: boolean;

    @ApiProperty({ type: [String], description: 'Roles com prefixo ORG atribuídos ao membro' })
    @Column({ type: 'varchar', array: true, default: [] })
    roles?: string[];

    @ApiProperty({ enum: ['ACTIVE', 'INVITED', 'REMOVED'], default: 'ACTIVE' })
    @Column({ default: 'ACTIVE' })
    status?: OrganizacaoMembroStatus;

    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    invitedByUserId?: string;
}
