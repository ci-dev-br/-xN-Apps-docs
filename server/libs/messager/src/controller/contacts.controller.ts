import { Controller, Post } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { ContactFindInput } from "./dto/input";
import { LazyListRollBack } from "@ci/core/data-io/lazy-list-roll-back";
/**
 * Contacts | Controller
 * 
 * Gerencie seus contatos e histórico de interações
 * 
 *  - [ ] Importat contatos;
 *  - [ ] Adicionar contato;
 *  - [ ] Gerenciar Contatos;
 * 
 * 
 */
@ApiTags('Contacts')
@Controller('Contacts')
export class ContactController {
    constructor() { }
    @Post('FindByNameOrPhonenumberContacts')
    @ApiResponse({
        description: 'FindByNameOrPhonenumberContacts',
    })
    async FindByNameOrPhonenumber(input: ContactFindInput) {
        return new LazyListRollBack();
    }
}