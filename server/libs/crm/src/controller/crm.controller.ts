import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CrmService } from "../crm.service";
import { DashboardCrmDto, ObterDashboardCrmDto } from "../dto/dashboard-crm.dto";

@ApiTags('Crm')
@Controller('Crm')
export class CrmController {
    constructor(
        private readonly crmService: CrmService,
    ) { }

    @Post('GetDashboard')
    @ApiResponse({ type: DashboardCrmDto })
    @ApiOperation({
        operationId: 'GetDashboardCrm',
        summary: 'Obtém a visão geral consolidada do dashboard CRM (KPIs, funil de oportunidades, etapas, atividades e contadores)'
    })
    async getDashboard(
        @Body() input?: ObterDashboardCrmDto,
        @Req() req?: any,
    ): Promise<DashboardCrmDto> {
        return await this.crmService.obterDashboard(input, req);
    }
}
