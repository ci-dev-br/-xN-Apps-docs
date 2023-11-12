import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreModule } from "src/core/core.module";

export const PaymentEntities = [

]

@Module({
    imports: [
        TypeOrmModule.forFeature(PaymentEntities),
        CoreModule,
    ]
})
export class PaymentModule { }