import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Funcionario } from "./models/funcionario.entity";
export const ProlaboreEntities = [
    Funcionario,
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