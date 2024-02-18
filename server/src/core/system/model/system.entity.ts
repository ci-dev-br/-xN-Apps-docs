import { Entity, PrimaryColumn } from "typeorm";

@Entity()
export class System {
    @PrimaryColumn({ type: 'varchar', length: 12 })
    mac?: string;
}