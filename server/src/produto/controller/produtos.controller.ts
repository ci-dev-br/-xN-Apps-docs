import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";


@ApiTags('Produtos')
@Controller('Produtos')
export class ProdutosController {
    async listar() {
    }
    async sync() {
    }
}