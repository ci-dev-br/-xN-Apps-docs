import { Controller, Get, Param, Post, Req, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SocialService } from "../service/social.service";
import { VinculoSocial } from "../models/vinculo-social.entity";
import { Public } from "@ci/auth/decorators/public.decorator";

@ApiTags('Social')
@Controller('Social')
export class SocialController {
    constructor(private readonly socialService: SocialService) { }

    /**
     * Segue outro usuário. Se for recíproco, ambos se tornam "conhecidos".
     */
    @Post('Follow/:userId')
    @ApiOperation({ operationId: 'SocialFollow' })
    @ApiResponse({ type: VinculoSocial })
    async follow(@Param('userId') targetUserId: string, @Req() req: any) {
        const currentUserId = req.user?.id;
        if (!currentUserId) {
            throw new UnauthorizedException('É necessário estar autenticado para seguir outro usuário.');
        }
        return await this.socialService.seguir(currentUserId, targetUserId);
    }

    /**
     * Deixa de seguir um usuário.
     */
    @Post('Unfollow/:userId')
    @ApiOperation({ operationId: 'SocialUnfollow' })
    async unfollow(@Param('userId') targetUserId: string, @Req() req: any) {
        const currentUserId = req.user?.id;
        if (!currentUserId) {
            throw new UnauthorizedException('É necessário estar autenticado para deixar de seguir.');
        }
        return await this.socialService.deixarDeSeguir(currentUserId, targetUserId);
    }

    /**
     * Retorna o status de conexão entre o usuário logado e o usuário consultado.
     */
    @Public()
    @Get('Status/:userId')
    @ApiOperation({ operationId: 'SocialStatus' })
    async getStatus(@Param('userId') targetUserId: string, @Req() req: any) {
        const currentUserId = req.user?.id;
        return await this.socialService.obterStatus(currentUserId, targetUserId);
    }

    /**
     * Retorna as conexões (seguidores, seguindo e conhecidos) do usuário logado ou especificado.
     */
    @Public()
    @Get('Conexoes')
    @ApiOperation({ operationId: 'SocialMinhasConexoes' })
    async getMinhasConexoes(@Req() req: any) {
        const currentUserId = req.user?.id;
        if (!currentUserId) {
            throw new UnauthorizedException('É necessário estar autenticado para consultar suas conexões.');
        }
        return await this.socialService.obterConexoes(currentUserId);
    }

    /**
     * Retorna as conexões públicas de um usuário especificado.
     */
    @Public()
    @Get('Conexoes/:userId')
    @ApiOperation({ operationId: 'SocialConexoesDe' })
    async getConexoesDe(@Param('userId') userId: string) {
        return await this.socialService.obterConexoes(userId);
    }
}
