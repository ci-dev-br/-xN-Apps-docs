import { Entity, PrimaryColumn } from "typeorm";

@Entity({
    schema: 'sys'
})
export class System {
    @PrimaryColumn({ type: 'varchar', length: 12 })
    mac?: string;
}