import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreModule } from "@ci/core/core.module";
import { DocumentoFiscal } from "./models/documento-fiscal";
import { DocumentoFiscalAnexo } from "./models/documento-fiscal-anexo.entity";
import { ManagerModule } from "@ci/manager";
import { NotaFiscal } from "./models/nota-fiscal.entity";
import { NotaFiscalController } from "./controller/nota-fiscal.controller";
import { NotaFiscalService } from "./services/nota-fiscal.service";
export const FiscalEntities = [
    DocumentoFiscal,
    DocumentoFiscalAnexo,
    NotaFiscal,
];
@Module({
    imports: [
        CoreModule,
        TypeOrmModule.forFeature(FiscalEntities),
        ManagerModule,
    ],
    controllers: [
        NotaFiscalController,
    ],
    providers: [
        NotaFiscalService,
    ]
})
export class FiscalModule { }
export {
    DocumentoFiscal as Document,
    DocumentoFiscalAnexo as Attachment,
}