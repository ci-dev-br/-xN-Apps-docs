import { SyncPayloadDao } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Endereco } from "../cadastro.module";

export class SyncPayloadDaoEndereco extends SyncPayloadDao<Endereco> {
    @ApiProperty({ type: Endereco })
    override data?: Endereco;
}
