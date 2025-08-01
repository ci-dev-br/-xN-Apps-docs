import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Projeto } from "./projeto.entity";
@Entity({
    schema,
})
export class WorkItem extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    code?: number;
    @ApiProperty({ type: Projeto })
    @ManyToMany(() => Projeto)
    @JoinTable()
    project?: Projeto;
}
