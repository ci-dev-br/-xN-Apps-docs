import { SyncPayloadDao } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { InformacaoContato } from "../cadastro.module";

export class SyncPayloadDaoInformacaoContato extends SyncPayloadDao<InformacaoContato> {
    @ApiProperty({ type: InformacaoContato })
    override data?: InformacaoContato;
}
