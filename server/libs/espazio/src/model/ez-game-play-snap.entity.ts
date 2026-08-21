import { FullAuditedEntity } from "@ci/manager";
import { EzGamePlay } from "./ez-game-play.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { schema } from "./schema";
@Entity({ schema })
export class EzGamePlaySnap extends FullAuditedEntity {
    @ManyToMany(() => EzGamePlay, gameplay => gameplay.internalId, { nullable: true, cascade: true })
    @JoinTable()
    gameplay?: EzGamePlay;
    @Column({ type: "jsonb", nullable: true })
    movement?: any;
}