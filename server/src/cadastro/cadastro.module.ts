import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Endereco } from "./model/endereco.entity";
import { Pessoa } from "./model/pessoa.entity";

export const CadastroEntidades = [
    Endereco,
    Pessoa,
]

@Module({
    imports: [
        TypeOrmModule.forFeature(CadastroEntidades)
    ]
})
export class CasdastroModule { }