import { SyncPayloadDao } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Pessoa } from "../cadastro.module";

export class SyncPayloadDaoPessoa extends SyncPayloadDao<Pessoa> {
    @ApiProperty({ type: Pessoa })
    override data?: Pessoa;
}
