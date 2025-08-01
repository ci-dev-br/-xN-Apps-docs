import { Module } from '@nestjs/common';
import { I11nService } from './i11n.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyCode } from '@ci/g11n';
import { Language } from './models/language.emtity';
import { Translation } from './models/translation.entity';
import { Dictionary } from './models/dictionary.entity';
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
  exports: [
    I11nService,
  ],
})
export class I11nModule { }