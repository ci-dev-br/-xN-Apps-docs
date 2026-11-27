import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreModule } from "@ci/core";
import { Icon } from "./models/icon.entity";
import { IconPack } from "./models/icon-pack.entity";
import { IconCrudService, IconPackCrudService, IconsServices } from "./services/icons.service";
import { IconController, IconPackController, IconsController } from "./controller/icons.controller";

export const IconEntities = [
    Icon,
    IconPack,
];

@Module({
    imports: [
        forwardRef(() => CoreModule),
        TypeOrmModule.forFeature(IconEntities),
    ],
    controllers: [
        IconController,
        IconPackController,
        IconsController,
    ],
    providers: [
        IconCrudService,
        IconPackCrudService,
        IconsServices,
        {
            provide: 'CLIENT.MODEL.EDITABLES',
            useValue: [
                ...(IconEntities.map(e => e.name)),
            ],
        },
    ],
    exports: [
        IconCrudService,
        IconPackCrudService,
        IconsServices,
    ],
})
export class IconsModule { }

export {
    Icon,
    IconPack,
    IconCrudService,
    IconPackCrudService,
    IconsServices,
};
