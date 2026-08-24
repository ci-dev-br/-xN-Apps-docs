import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndicatorConfig } from '../model/indicator-config.entity';
import { CreateIndicatorConfigDto } from '../dto/create-indicator-config.dto';

@Injectable()
export class IndicatorConfigService {
    constructor(
        @InjectRepository(IndicatorConfig)
        private readonly configRepository: Repository<IndicatorConfig>,
    ) { }

    async create(dto: CreateIndicatorConfigDto): Promise<IndicatorConfig> {
        const exists = await this.configRepository.findOne({
            where: [{ name: dto.name }, { code: dto.code }],
        });

        if (exists) {
            throw new ConflictException('Já existe um indicador com este nome ou código SGS.');
        }

        const newConfig = this.configRepository.create(dto);
        return this.configRepository.save(newConfig);
    }

    async findAllActive(): Promise<IndicatorConfig[]> {
        return this.configRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
    }
}