import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Agent } from "./models/agent";
export const CodeXEntities = [
    Agent,
];
@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...CodeXEntities,
        ])
    ],
    exports: [

    ],
    controllers: [

    ],
    providers: [

    ],
})
export class CodexModule { }
