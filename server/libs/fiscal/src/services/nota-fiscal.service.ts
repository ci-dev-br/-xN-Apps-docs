import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotaFiscal } from '../models/nota-fiscal.entity';
import { CreateNotaFiscalDto } from '../dto/create-nota-fiscal.dto';

@Injectable()
export class NotaFiscalService {
    private readonly logger = new Logger(NotaFiscalService.name);

    constructor(
        @InjectRepository(NotaFiscal)
        private notaFiscalRepository: Repository<NotaFiscal>,
    ) { }

    async emitir(dto: CreateNotaFiscalDto): Promise<NotaFiscal> {
        // 1. Salva a nota no banco como PENDENTE
        const novaNota = this.notaFiscalRepository.create({
            ...dto,
            status: 'PENDENTE',
        });
        const notaSalva = await this.notaFiscalRepository.save(novaNota);

        try {
            this.logger.log(`Iniciando emissão para Prefeitura de Curitiba: ${notaSalva.internalId}`);

            // 2. Aqui entra a integração real com SEFAZ/Prefeitura
            // Você pode usar uma API de terceiros ou montar o XML SOAP.
            const respostaSefaz = await this.integracaoSefazCuritibaMock(dto);

            // 3. Atualiza o status no banco de dados
            notaSalva.status = 'AUTORIZADA';
            notaSalva.numeroNota = respostaSefaz.numero;
            notaSalva.codigoVerificacao = respostaSefaz.codigoVerificacao;

            return await this.notaFiscalRepository.save(notaSalva);
        } catch (error) {
            this.logger.error(`Erro ao emitir NF: ${error.message}`);
            notaSalva.status = 'REJEITADA';
            await this.notaFiscalRepository.save(notaSalva);
            throw error;
        }
    }

    // Simulação da chamada ao Web Service da Prefeitura de Curitiba
    private async integracaoSefazCuritibaMock(dados: any): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    numero: Math.floor(Math.random() * 10000).toString(),
                    codigoVerificacao: 'AB12-CD34',
                });
            }, 2000);
        });
    }
}