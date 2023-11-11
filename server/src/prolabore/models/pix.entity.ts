import { Entity } from "typeorm";
import { Cliente } from "./cliente.entity";

@Entity()
export class TransferenciaPix {
    customer: Cliente;
        
}