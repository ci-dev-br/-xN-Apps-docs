import { FullAuditedEntity } from 'src/core/dao';
import { Column, Entity } from 'typeorm';


export interface IServerInfo { }

@Entity()
export class Server extends FullAuditedEntity {
    @Column({ type: 'jsonb', nullable: true })
    fullInfo?: IServerInfo;
}