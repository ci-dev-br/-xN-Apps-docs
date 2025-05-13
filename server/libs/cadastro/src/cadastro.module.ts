import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Endereco } from "./model/endereco.entity";
import { Pessoa } from "./model/pessoa.entity";
import { PessoaService } from "./service/pessoa.service";
import { EnderecoService } from "./service/endereco.service";
import { CoreModule } from "@ci/core/core.module";
import { InformacaoContato } from "./model/informacao-contato.entity";
import { PessoaController } from "./controller/pessoa.controller";
import { DocumentoIdentificacao } from "./model/documento-identificacao.entity";
import { TipoDocumentoIdentificacao } from "./model/tipo-documento-identificacao.entity";
import { CadastroController } from "./controller/cadastro.controller";
import { CadastroPessoaForm } from "./service/cadastros/cadastro-pessoa.form";
import { CadastroEnderecoForm } from "./service/cadastros/cadastro-endereco.form";
import { CadastroImagensForm } from "./service/cadastros/cadastro-imagens.form";
import { Category } from "./model/category.entity";
import { UnidadeMedida } from "./model/unidade-medida.entity";
import { CategoryService } from "./service/category.service";
import { InformacaoContatoService } from "./service/informacao-contato.service";
import { UnidadeMedidaService } from "./service/unidade-medida.service";
import { EnderecoController } from "./controller/endereco.controller";
import { InformacaoContatoController } from "./controller/informacao-contato.controller";
import { UnidadeMedidaController } from "./controller/unidade-medida.controller";
import { endWith } from "rxjs";
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
    Category,
    UnidadeMedida,
]
@Module({
    imports: [
        CoreModule,
        TypeOrmModule.forFeature(CadastroEntidades),
    ],
    providers: [
        CategoryService,
        PessoaService,
        EnderecoService,
        InformacaoContatoService,
        UnidadeMedidaService,
        ...FORM_PROVIDERS,
        {
            provide: 'FORM_PROVIDERS',
            useValue: [
                ...FORM_PROVIDERS
            ]
        },
        {
            provide: 'CLIENT.MODEL.EDITABLES',
            useValue: [
                ...(CadastroEntidades.map(e => e.name))
            ]
        }

    ],
    controllers: [
        CadastroController,
        EnderecoController,
        InformacaoContatoController,
        PessoaController,
        UnidadeMedidaController,
    ]
})
export class CasdastroModule { }
export {
    Endereco,
    Pessoa,
    InformacaoContato,
    DocumentoIdentificacao,
    TipoDocumentoIdentificacao,
    Category,
}