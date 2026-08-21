import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from "@nestjs/core";
import { AuthController } from "./controller/auth.controller";
import { UserService } from "./service/user.service";
import { User } from "./models/user.entity";
import { jwtConstants } from "./constants";
import { AuthGuard } from "./auth.guard";
import { CredencialService } from "./service/credencial.service";
// import { Credential } from "@ci/core";
import { Policy } from "./models/policy.entity";
import { RefreshTokenStrategy } from "./service/refresh-token-strategy";
import { AuthService } from "./service/auth.service";
import { DeviceAuthenticated } from "./models/device-autenticated.entity";
import { TenantModule } from "@ci/tenant/tenant.module";
import { AccessCredential } from "./models/user-credential.entity";
import { UserCredentialService } from "./service/user-credential.service";
import { CoreModule } from "@ci/core/core.module";
import { TwoFactorAuthenticationService } from "./service/two-factors.service";
import { NotificacaoModule } from "@ci/notification";
import { Register } from "./models/register.entity";
import { RegisterService } from "./service/register.service";
import { RegisterController } from "./controller/register.controller";
import { Invite } from "./models/invite.entity";
import { InviteService } from "./service/invite.service";
import { InviteController } from "./controller/invite.controller";
import { StorageModule } from "@ci/storage";
import { UserPreference } from "./models/user-preference.entity";
export interface IAuthOption {
    secret?: string;
}
export const AuthEntities = [
    Policy,
    User,
    DeviceAuthenticated,
    AccessCredential,
    Register,
    Invite,
    UserPreference,
];
@Module({
    imports: [
        TypeOrmModule.forFeature([
            ...AuthEntities
        ]),
        JwtModule.registerAsync({
            useFactory: async () => ({
                secret: process.env.MASTER_PASSWORD_AUTHORYTHY || jwtConstants.secret,
                global: true, // <~ será que isso é necessário?
                signOptions: {
                    expiresIn: '60s'
                }
            }),
        }),
        // forwardRef(() => StorageModule),
        TenantModule,
        CoreModule,
        NotificacaoModule,
        StorageModule,
    ],
    controllers: [
        AuthController,
        RegisterController,
        InviteController,
    ],
    providers: [
        UserService,
        AuthService,
        CredencialService,
        UserCredentialService,
        RefreshTokenStrategy,
        RegisterService,
        TwoFactorAuthenticationService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        InviteService,
    ],
    exports: [
        UserService,
        AuthService,
        CredencialService,
    ]
})
export class AuthModule { }
export {
    UserService,
    CredencialService,
    AuthService,
    InviteService,
}