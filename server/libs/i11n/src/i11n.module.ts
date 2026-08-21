import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyCode } from '@ci/g11n';
import { Language } from './models/language.emtity';
import { Translation } from './models/translation.entity';
import { Dictionary } from './models/dictionary.entity';
import { I11nController } from './controller/i11n.controller';
import { I11nService } from './services/i11n.service';
export const I11nEntities = [
  CurrencyCode,
  Language,
  Translation,
  Dictionary,
]
/**
 * Internacionalização
 * 
 * 
 * ## Entidades
 * 
 * | Nome | Descrição | 
 * | --- | --- | 
 * | Currency Code | Currency Code |
 * | Language | Language |
 * | Translation | Translation |
 * | Dictionary | Book of translations |
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ...I11nEntities,
    ])
  ],
  providers: [
    I11nService,
  ],
  controllers: [
    I11nController,
  ],
  exports: [
    I11nService,
  ],
})
export class I11nModule { }