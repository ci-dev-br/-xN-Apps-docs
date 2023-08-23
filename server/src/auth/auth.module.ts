import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeORMError } from "typeorm";

@Module({
    imports: [
        TypeOrmModule,
    ]
})
export class AuthModule { }