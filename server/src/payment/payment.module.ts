import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreModule } from "src/core/core.module";
import { Payment } from "./model/payment.entity";
import { PaymentAuthorization } from "./model/payment-authorization.entity";

export const PaymentEntities = [
    Payment,
    PaymentAuthorization,
]

@Module({
    imports: [
        TypeOrmModule.forFeature(PaymentEntities),
        CoreModule,
    ]
})
export class PaymentModule { }