import { FullAuditedEntity } from "@ci/manager";
import { Column, Entity } from "typeorm";
export interface ISchema {

}
@Entity({ schema: 'Dyn' })
export class CadastroGeneralista<T> extends FullAuditedEntity {
    @Column({ type: "jsonb" })
    RAW?: T;
    @Column({ type: "jsonb" })
    RULES?: ISchema;
}