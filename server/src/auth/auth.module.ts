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
import { DeviceAuthenticated } from "./models/device-autenticated.entity";
import { TenantModule } from "src/tenant/tenant.module";
import { AccessCredential } from "./models/user-credential.entity";
import { UserCredentialService } from "./service/user-credential.service";

export const AuthEntities = [
    Policy,
    User,
    ChaveAcesso,
    DeviceAuthenticated,
    AccessCredential,
];

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...AuthEntities
        ]),
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '60s' },
        }),
        TenantModule,
    ],
    controllers: [
        AuthController,
    ],
    providers: [ 
        UserService,
        AuthService,
        CredencialService,
        UserCredentialService,
        RefreshTokenStrategy,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
    exports: [
        UserService,
        AuthService,
    ]
})
export class AuthModule { }
export {
    UserService,
    CredencialService,
    AuthService,
}