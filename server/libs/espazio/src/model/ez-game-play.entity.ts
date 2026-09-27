import { Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { schema } from "./schema";
import { EzPlayer } from "./ez-player.entity";
import { ApiProperty } from "@nestjs/swagger";
import { FullAuditedEntity } from "@ci/manager";
import { EzGamePalayType } from "./ez-game-play-type.entity";
@Entity({
    schema
})
export class EzGamePlay extends FullAuditedEntity {
    @ApiProperty({ nullable: true, required: false })
    @OneToMany(() => EzPlayer, player => player.gameplay, { nullable: true, cascade: true })
    @JoinColumn()
    players?: EzPlayer[];
    @ApiProperty({
        nullable: true
    })
    @ManyToOne(() => EzGamePalayType) @JoinColumn()
    type?: EzGamePalayType;
}