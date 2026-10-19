import { SyncPayloadDao } from "@ci/manager";
import { ApiProperty } from "@nestjs/swagger";
import { Endereco } from "../model/endereco.entity";

export class SyncPayloadDaoEndereco extends SyncPayloadDao<Endereco> {
    @ApiProperty({ type: () => Endereco })
    override data?: Endereco;
}
