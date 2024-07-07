import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreModule } from "@ci/core/core.module";
import { Document } from "./models/document";
import { Attachment } from "./models/attachment.entity";

export const FiscalEntities = [
    Document,
    Attachment,
];
@Module({
    imports: [
        CoreModule,
        TypeOrmModule.forFeature(FiscalEntities)
    ],
})
export class FiscalModule { }