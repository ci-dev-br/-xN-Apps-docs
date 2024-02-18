import { Module } from "@nestjs/common";
import { SystemService } from "./system.service";
import { SystemController } from "./system.controller";
import { System } from "./model/system.entity";

export const SystemEntities = [
    System,
];
@Module({
    imports: [

    ],
    exports: [
        
    ],
    controllers: [
        SystemController,
    ],
    providers: [
        SystemService,
    ],
})
export class SystemModule { }