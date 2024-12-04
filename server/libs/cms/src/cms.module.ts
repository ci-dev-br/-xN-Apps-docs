import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreModule } from "@ci/core/core.module";
import { Website } from './models/website.entity';
export const CmsEntities = [
    Website,
];
@Module({
    imports: [
        TypeOrmModule.forFeature(CmsEntities),
        CoreModule,
    ]
})
export class CmsModule { }
export {
    Website
}