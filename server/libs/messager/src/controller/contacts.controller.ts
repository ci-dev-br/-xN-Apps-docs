import { Controller, Post } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { ContactFindInput } from "./dto/input";

@ApiTags('Contacts')
@Controller('Contacts')
export class ContactController {
    constructor() { }

    @Post('FindByNameOrPhonenumber')
    @ApiResponse({
        description: 'FindByNameOrPhonenumber',
    })
    async FindByNameOrPhonenumber(input: ContactFindInput) {
            
    }
}