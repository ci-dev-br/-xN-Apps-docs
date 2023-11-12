import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Autonomo } from "./models/autonomo.entity";
import { Account } from "./models/account.entity";
import { Banco } from "./models/banco.entity";
import { ClienteAssas } from "./models/cliente-assas.entity";
import { Cliente } from "./models/cliente.entity";
import { Contrato } from "./models/contrato.entity";
import { Order } from "./models/order.entity";
import { Payment } from "./models/payment.entity";
import { TransferenciaPix } from "./models/transferencia-pix.entity";
import { ContaBancaria } from "./models/conta-bancaria.entity";
import { Receipt } from "./models/receipt.entity";
export const ProlaboreEntities = [
    Autonomo,
    ClienteAssas,
    Cliente,
    Contrato,
    Order,
    TransferenciaPix,
    ContaBancaria,
    Contrato,

    Account,
    Receipt,    
    Banco,
    Payment,
];
@Module({
    imports: [
        TypeOrmModule.forFeature(ProlaboreEntities)
    ],
    exports: [

    ],
    controllers: [

    ],
    providers: [

    ]
})
export class ProlaboreModule { }