import { Controller, Post } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { ContactFindInput } from "./dto/input";
import { LazyListRollBack } from "@ci/core/data-io/lazy-list-roll-back";
@ApiTags('Contacts')
@Controller('Contacts')
export class ContactController {
    constructor() { }
    @Post('FindByNameOrPhonenumber')
    @ApiResponse({
        description: 'FindByNameOrPhonenumber',
    })
    async FindByNameOrPhonenumber(input: ContactFindInput) {
        return new LazyListRollBack();
    }
}