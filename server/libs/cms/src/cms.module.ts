import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreModule } from "@ci/core/core.module";
import { Website } from './models/website.entity';
import { SitePage } from "./models/page.entity";
export const CmsEntities = [
    Website,
    SitePage,
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