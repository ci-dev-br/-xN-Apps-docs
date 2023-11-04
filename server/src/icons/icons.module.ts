import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Icon } from "./models/icon.entity";

export const IconEntities = [
    Icon,
];

@Module({
    imports: [
        TypeOrmModule.forFeature(IconEntities)
    ]
})
export class IconsModule { }