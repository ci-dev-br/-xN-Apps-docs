import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SystemService } from "./system.service";
import { SystemController } from "./system.controller";
import { System } from "./model/system.entity";
import { Status } from "./model/status";

export const SystemEntities = [
    Status,
    System,
];
@Module({
    imports: [
        TypeOrmModule.forFeature([...SystemEntities])
    ],
    controllers: [
        SystemController,
    ],
    providers: [
        SystemService,
    ],
})
export class SystemModule { }