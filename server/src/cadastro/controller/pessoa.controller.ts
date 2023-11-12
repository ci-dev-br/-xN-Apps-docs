import { Controller } from "@nestjs/common";
import { PessoaService } from "../service/pessoa.service";

@Controller('Cadastro/Pessoa')
export class PessoaController {
    constructor(
        private readonly pessoaService: PessoaService
    ) { }

    // async
}