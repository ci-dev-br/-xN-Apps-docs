import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from "@nestjs/core";
import { AuthController } from "./controller/auth.controller";
import { UserService } from "./service/user.service";
import { User } from "./models/user.entity";
import { jwtConstants } from "./constants";
import { AuthGuard } from "./auth.guard";
import { CredencialService } from "./service/credencial.service";
import { ChaveAcesso } from "./models/chave-acesso.entity";
import { Policy } from "./models/policy.entity";
import { RefreshTokenStrategy } from "./service/refresh-token-strategy";
import { AuthService } from "./service/auth.service";

export const Entities = [
    Policy,
    User,
    ChaveAcesso,
];

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...Entities
        ]),
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '60s' },
        }),
    ],
    controllers: [
        AuthController,
    ],
    providers: [
        UserService,
        AuthService,
        CredencialService,
        RefreshTokenStrategy,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
    exports: [
        UserService,
    ]
})
export class AuthModule { }
export {
    UserService,
    CredencialService,
    AuthService,
}