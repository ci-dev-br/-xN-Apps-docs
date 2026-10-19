import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./controllers/user.controller";
import { SocialController } from "./controllers/social.controller";
import { SocialService } from "./service/social.service";
import { VinculoSocial } from "./models/vinculo-social.entity";
import { AuthModule } from "@ci/auth/auth.module";
import { User } from "@ci/auth/models/user.entity";

export const UserEntities = [
    VinculoSocial,
];

@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forFeature([
            VinculoSocial,
            User,
        ]),
    ],
    providers: [
        SocialService,
    ],
    controllers: [
        UserController,
        SocialController,
    ],
    exports: [
        SocialService,
    ],
})
export class UsersModule { }
export { VinculoSocial, TipoVinculoSocial } from "./models/vinculo-social.entity";
export { SocialService } from "./service/social.service";
