import { SyncPayloadDao } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Organizacao } from "../model/organizacao.entity";

export class SyncPayloadDaoOrganizacao extends SyncPayloadDao<Organizacao> {
    @ApiProperty({ type: Organizacao })
    override data?: Organizacao;
}
