import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CmsService } from "../cms.service";
import { DashboardCmsDto, ObterDashboardCmsDto } from "../dto/dashboard-cms.dto";

@ApiTags('Cms')
@Controller('Cms')
export class CmsController {
    constructor(
        private readonly cmsService: CmsService,
    ) { }

    @Post('GetDashboard')
    @ApiResponse({ type: DashboardCmsDto })
    @ApiOperation({
        operationId: 'GetDashboardCms',
        summary: 'Obtém a visão geral consolidada do dashboard CMS (KPIs, conteúdos, páginas, mídias, websites, comentários e termos)',
    })
    async getDashboard(
        @Body() input?: ObterDashboardCmsDto,
        @Req() req?: any,
    ): Promise<DashboardCmsDto> {
        return await this.cmsService.obterDashboard(input, req);
    }
}
