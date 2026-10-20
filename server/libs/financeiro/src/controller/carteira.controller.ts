import { Body, Controller, Get, Post, Query, Req, UnauthorizedException } from "@nestjs/common";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CarteiraService } from "../service/carteira.service";
import { Carteira } from "../model/carteira.entity";
import { TransacaoCarteira } from "../model/transacao-carteira.entity";

export class DepositoIdentificadoDto {
    @ApiProperty({ description: 'Valor a ser depositado na carteira (em R$)', example: 150.00 })
    valor: number;

    @ApiProperty({ description: 'Identificador do depósito (ex: comprovante, código pix)', required: false })
    identificador?: string;

    @ApiProperty({ description: 'Descrição da operação', required: false, example: 'Depósito identificado via PIX' })
    descricao?: string;

    @ApiProperty({ description: 'Metadados adicionais da transação', required: false })
    metadados?: any;
}

export class PagarFaturaComCarteiraDto {
    @ApiProperty({ description: 'Identificador único da fatura a ser liquidada', example: 'FAT-2026-0091' })
    faturaId: string;

    @ApiProperty({ description: 'Valor da fatura a ser debitado da carteira', example: 89.90 })
    valor: number;

    @ApiProperty({ description: 'Descrição do pagamento', required: false, example: 'Pagamento de fatura de serviços de nuvem' })
    descricao?: string;

    @ApiProperty({ description: 'Metadados adicionais da fatura', required: false })
    metadados?: any;
}

@ApiTags('Carteira')
@Controller('Financeiro/Carteira')
export class CarteiraController {
    constructor(
        private readonly carteiraService: CarteiraService
    ) { }

    private getUserId(req: any): string {
        const userId = req.user?.id || req.chaveAcesso;
        if (!userId) {
            // Em ambiente de teste/demonstração quando não autenticado, utiliza ID padrão ou convidado
            return 'guest_user_demo';
        }
        return userId;
    }

    /**
     * Retorna a visão geral da carteira do usuário atual (saldo, número para depósitos e movimentações)
     */
    @Get('Minha')
    @ApiOperation({ operationId: 'CarteiraGetMinha', summary: 'Obtém a carteira do usuário com saldo e histórico recente' })
    async getMinhaCarteira(@Req() req: any) {
        const userId = this.getUserId(req);
        return await this.carteiraService.obterVisaoGeralCarteira(userId);
    }

    /**
     * Registra um depósito identificado na carteira do usuário
     */
    @Post('Deposito')
    @ApiOperation({ operationId: 'CarteiraRegistrarDeposito', summary: 'Registra um depósito identificado e adiciona saldo' })
    async registrarDeposito(
        @Req() req: any,
        @Body() body: DepositoIdentificadoDto
    ) {
        const userId = this.getUserId(req);
        return await this.carteiraService.registrarDeposito(userId, body);
    }

    /**
     * Realiza o pagamento de uma fatura utilizando o saldo da carteira
     */
    @Post('PagarFatura')
    @ApiOperation({ operationId: 'CarteiraPagarFatura', summary: 'Paga uma fatura utilizando o saldo disponível na carteira' })
    async pagarFatura(
        @Req() req: any,
        @Body() body: PagarFaturaComCarteiraDto
    ) {
        const userId = this.getUserId(req);
        return await this.carteiraService.pagarFatura(userId, body);
    }

    /**
     * Consulta o extrato de transações de entrada e saída com filtros
     */
    @Get('Transacoes')
    @ApiOperation({ operationId: 'CarteiraListarTransacoes', summary: 'Lista extrato de movimentações da carteira' })
    async listarTransacoes(
        @Req() req: any,
        @Query('tipo') tipo?: 'ENTRADA' | 'SAIDA',
        @Query('categoria') categoria?: string,
        @Query('take') take?: string,
        @Query('skip') skip?: string
    ) {
        const userId = this.getUserId(req);
        return await this.carteiraService.listarTransacoes(userId, {
            tipo,
            categoria,
            take: take ? parseInt(take, 10) : 50,
            skip: skip ? parseInt(skip, 10) : 0,
        });
    }

    /**
     * Avalia se o usuário cumpriu os requisitos para receber a ROLE DEVELOPER como cortesia:
     * - E-mail verificado (emailVerificado === true)
     * - Saldo na carteira >= 50
     * - Autoria comprovada no projeto (PR aceito na branch development) vinculada ao mesmo e-mail
     */
    @Post('AvaliarRoleDeveloper')
    @ApiOperation({ operationId: 'CarteiraAvaliarRoleDeveloper', summary: 'Avalia e concede a ROLE DEVELOPER de cortesia por autoria e saldo' })
    async avaliarRoleDeveloper(@Req() req: any) {
        const userId = this.getUserId(req);
        return await this.carteiraService.verificarEConcederRoleDeveloper(userId);
    }
}
