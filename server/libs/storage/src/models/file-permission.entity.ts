import { Column, Entity } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";


@Entity({
    schema
})
export class FilePermission extends FullAuditedEntity {
    @Column({ enum: ['GRANT', 'DANY'] })
    role: 'GRANT' | 'DANY';
    @Column({ nullable: true })
    path?: string;
    @Column({ nullable: true })
    status?: 'PENDING' | 'GRANTED' | 'DENIED';
    @Column({ nullable: true })
    requestToken?: string;
    @Column({ nullable: true })
    requestedByUserId?: string;
    @Column({ nullable: true })
    requestedByEmail?: string;
    @Column({ nullable: true })
    requestedByName?: string;
    @Column({ nullable: true })
    authorizedByUserId?: string;
    @Column({ nullable: true })
    reason?: string;
    @Column({ nullable: true })
    authorizedAt?: Date;
}
