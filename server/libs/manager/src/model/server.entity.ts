import { ApiProperty } from "@nestjs/swagger";
// import { FullAuditedEntity } from "@ci/core"
import { Column, Entity } from "typeorm";
import { FullAuditedEntity } from "../dao";


@Entity()
export class Server extends FullAuditedEntity {
   
    @ApiProperty({ nullable: true, required: false })
    @Column({ nullable: true })
    endpoint?: string;
}