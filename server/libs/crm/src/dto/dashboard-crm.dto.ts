import { ApiProperty } from "@nestjs/swagger";
import { Oportunidade } from "../models/oportunidade";
import { AtividadeCrm } from "../models/atividade-crm";
import { ClienteCrm } from "../models/cliente";
import { EstagioOportunidade } from "../models/estagio-oportunidade";

export class ObterDashboardCrmDto {
    @ApiProperty({
        title: 'Responsável',
        description: 'Filtro opcional pelo nome do responsável no funil (ou "Todos")',
        required: false,
        nullable: true,
    })
    responsavel?: string;

    @ApiProperty({
        title: 'Incluir Perdidas',
        description: 'Indica se oportunidades marcadas como perdidas devem ser incluídas na listagem',
        required: false,
        nullable: true,
        default: false,
    })
    incluirPerdidas?: boolean;

    @ApiProperty({
        title: 'Tenants IDs',
        description: 'Lista opcional de IDs de tenants para segmentação da visão do dashboard',
        type: String,
        isArray: true,
        required: false,
        nullable: true,
    })
    tenantIds?: string[];

    @ApiProperty({
        title: 'Tenant ID',
        description: 'ID único opcional de tenant para segmentação',
        required: false,
        nullable: true,
    })
    tenantId?: string;
}

export class DashboardCrmKpisDto {
    @ApiProperty({ title: 'Pipeline Ativo (R$)', type: 'number' })
    pipelineAtivo: number;

    @ApiProperty({ title: 'Total Fechado / Ganho (R$)', type: 'number' })
    totalGanho: number;

    @ApiProperty({ title: 'Oportunidades em Aberto', type: 'number' })
    oportunidadesEmAberto: number;

    @ApiProperty({ title: 'Total de Oportunidades', type: 'number' })
    totalOportunidades: number;

    @ApiProperty({ title: 'Oportunidades Ganhas', type: 'number' })
    oportunidadesGanhas: number;

    @ApiProperty({ title: 'Oportunidades Perdidas', type: 'number' })
    oportunidadesPerdidas: number;

    @ApiProperty({ title: 'Taxa de Conversão (%)', type: 'number' })
    taxaConversao: number;

    @ApiProperty({ title: 'Ticket Médio (R$)', type: 'number' })
    ticketMedio: number;

    @ApiProperty({ title: 'Ciclo Médio (Dias)', type: 'number' })
    cicloMedioDias: number;

    @ApiProperty({ title: 'Atividades Pendentes', type: 'number' })
    atividadesPendentes: number;

    @ApiProperty({ title: 'Atividades Concluídas', type: 'number' })
    atividadesConcluidas: number;
}

export class DashboardCrmContadoresDto {
    @ApiProperty({ type: 'number' })
    clientes: number;

    @ApiProperty({ type: 'number' })
    atendimentos: number;

    @ApiProperty({ type: 'number' })
    agendamentos: number;

    @ApiProperty({ type: 'number' })
    historicoContatos: number;

    @ApiProperty({ type: 'number' })
    produtos: number;

    @ApiProperty({ type: 'number' })
    servicos: number;

    @ApiProperty({ type: 'number' })
    promocoes: number;

    @ApiProperty({ type: 'number' })
    campanhas: number;

    @ApiProperty({ type: 'number' })
    profissionais: number;

    @ApiProperty({ type: 'number' })
    vendasProdutos: number;

    @ApiProperty({ type: 'number' })
    pagamentos: number;
}

export class DashboardCrmEtapaResumoDto {
    @ApiProperty({ enum: EstagioOportunidade })
    id: EstagioOportunidade;

    @ApiProperty({ type: 'string' })
    titulo: string;

    @ApiProperty({ type: 'string' })
    cor: string;

    @ApiProperty({ type: 'number' })
    quantidade: number;

    @ApiProperty({ type: 'number' })
    valorTotal: number;
}

export class DashboardCrmDto {
    @ApiProperty({ type: DashboardCrmKpisDto })
    kpis: DashboardCrmKpisDto;

    @ApiProperty({ type: DashboardCrmContadoresDto })
    contadores: DashboardCrmContadoresDto;

    @ApiProperty({ type: DashboardCrmEtapaResumoDto, isArray: true })
    etapas: DashboardCrmEtapaResumoDto[];

    @ApiProperty({ type: Oportunidade, isArray: true })
    oportunidades: Oportunidade[];

    @ApiProperty({ type: AtividadeCrm, isArray: true })
    atividades: AtividadeCrm[];

    @ApiProperty({ type: 'string', isArray: true })
    responsaveis: string[];

    @ApiProperty({ type: ClienteCrm, isArray: true })
    clientes: ClienteCrm[];
}
