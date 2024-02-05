import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Endereco } from "./model/endereco.entity";
import { Pessoa } from "./model/pessoa.entity";
import { PessoaService } from "./service/pessoa.service";
import { EnderecoService } from "./service/endereco.service";
import { CoreModule } from "src/core/core.module";
import { InformacaoContato } from "./model/informacao-contato.entity";
import { PessoaController } from "./controller/pessoa.controller";
import { DocumentoIdentificacao } from "./model/documento-identificacao.entity";
import { TipoDocumentoIdentificacao } from "./model/tipo-documento-identificacao.entity";
import { CadastroController } from "./controller/cadastro.controller";
import { CadastroBase } from "./service/CadastroBase";
import { CadastroPessoaForm } from "./service/cadastros/cadastro-pessoa.form";
import { CadastroEnderecoForm } from "./service/cadastros/cadastro-endereco.form";
import { CadastroImagensForm } from "./service/cadastros/cadastro-imagens.form";



const FORM_PROVIDERS = [
    CadastroPessoaForm,
    CadastroEnderecoForm,
    CadastroImagensForm,
]

export const CadastroEntidades = [
    Endereco,
    Pessoa,
    InformacaoContato,
    DocumentoIdentificacao,
    TipoDocumentoIdentificacao,
]

@Module({
    imports: [
        CoreModule,
        TypeOrmModule.forFeature(CadastroEntidades),
    ],
    providers: [
        PessoaService,
        EnderecoService,
        ...FORM_PROVIDERS,
        {
            provide: 'FORM_PROVIDERS',
            useValue: [
                ...FORM_PROVIDERS
            ]
        }
    ],
    controllers: [
        CadastroController,
        PessoaController,
    ]
})
export class CasdastroModule { }