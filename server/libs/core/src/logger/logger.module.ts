import { Module } from "@nestjs/common";
import { LoggerController } from "./logger.controller";
import { LoggerService } from "./logger.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Log } from "./log.entity";
export const entities = [Log];
/**
 * Logger Modules
 */
@Module({
    imports: [
        TypeOrmModule.forFeature(entities),
    ],
    exports: [

    ],
    providers: [
        LoggerService,
    ],
    controllers: [
        LoggerController
    ],
})
export class LoggerModule { }