import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserInteractionService } from "../service/user-interaction.service";
import { InteractionPayload } from "@ci/auth/controller/dto/interaction-payload";


@ApiTags('UserInteraction')
@Controller('UserInteraction')
export class UserInteractionController {
    constructor(
        private readonly userInteraction: UserInteractionService,
    ) { }



    /**
    *   As interações permitem registrar comportamentos do usuário dentro da plataforma
    * para rastrear interações com objetos específicos sem precisar implementas
    * estruturas adicionais nos objetos 
    * */
    @Post('Interaction')
    @ApiOperation({ operationId: 'Interaction' })
    public async interaction(
        @Body() payload: InteractionPayload,
        @Req() request: any) {
        try {

        } catch (error) {
            return {
                status: 500,
                message: 'Falha'
            }
        }
    }

}