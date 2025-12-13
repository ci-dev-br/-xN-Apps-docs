import { SyncPayloadDao } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Pais } from "../model/pais.entity";

export class SyncPayloadDaoPais extends SyncPayloadDao<Pais> {
    @ApiProperty({ type: Pais })
    override data?: Pais;
}
