import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";


@Entity({
    schema
})
export class FilePermission extends FullAuditedEntity {
    @Column({ enum: ['GRANT', 'DANY'] })
    type: 'GRANT' | 'DANY';
    @Column({ nullable: true })
    path?: string;
}