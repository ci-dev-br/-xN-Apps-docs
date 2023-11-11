import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Autonomo } from "./models/autonomo.entity";
export const ProlaboreEntities = [
    Autonomo,
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