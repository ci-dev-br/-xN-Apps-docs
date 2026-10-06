import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";

export interface IStack {
    scope?: any;
    status?: string;
    action: string;
    parameters?: { [a: string]: any };
}

@Entity({ schema })
export class Action extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true })
    title?: string;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true })
    description?: string;
    @ApiProperty({ nullable: true, required: false }) @Column({ nullable: true, type: 'jsonb', array: true })
    stack: IStack[];
}