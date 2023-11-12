import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Endereco } from "./model/endereco.entity";
import { Pessoa } from "./model/pessoa.entity";
import { PessoaService } from "./service/pessoa.service";
import { EnderecoService } from "./service/endereco.service";
import { CoreModule } from "src/core/core.module";

export const CadastroEntidades = [
    Endereco,
    Pessoa,
]

@Module({
    imports: [
        CoreModule,
        TypeOrmModule.forFeature(CadastroEntidades),
    ],
    providers: [
        PessoaService,
        EnderecoService,
    ]
})
export class CasdastroModule { }