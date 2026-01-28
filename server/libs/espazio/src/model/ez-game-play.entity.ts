import { Entity, ManyToMany } from "typeorm";
import { schema } from "./schema";
import { EzPlayer } from "./ez-player.entity";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";

@Entity({
    schema
})
export class EzGamePlay extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @ManyToMany(() => EzPlayer, { cascade: true })
    players?: EzPlayer[];
}