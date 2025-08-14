import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreModule } from "@ci/core/core.module";
import { DocumentoFiscal } from "./models/documento-fiscal";
import { DocumentoFiscalAnexo } from "./models/documento-fiscal-anexo.entity";
import { ManagerModule } from "@ci/manager";
export const FiscalEntities = [
    DocumentoFiscal,
    DocumentoFiscalAnexo,
];
@Module({
    imports: [
        CoreModule,
        TypeOrmModule.forFeature(FiscalEntities),
        ManagerModule,
    ],
})
export class FiscalModule { }
export {
    DocumentoFiscal as Document,
    DocumentoFiscalAnexo as Attachment,
}