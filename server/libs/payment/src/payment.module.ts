import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreModule } from "@ci/core/core.module";
import { Payment } from "./model/payment.entity";
import { PaymentAuthorization } from "./model/payment-authorization.entity";
import { MethodPayment } from "./model/payment-method.entity";
export const PaymentEntities = [
    Payment,
    PaymentAuthorization,
    MethodPayment,
]
@Module({
    imports: [
        TypeOrmModule.forFeature(PaymentEntities),
        CoreModule,
    ]
})
export class PaymentModule { }
export {
    Payment,
    PaymentAuthorization,
    MethodPayment,
}