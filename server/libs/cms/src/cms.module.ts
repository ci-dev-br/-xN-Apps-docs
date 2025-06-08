import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreModule } from "@ci/core/core.module";
import { Website } from './models/website.entity';
import { SitePage } from "./models/page.entity";
import { CommentMeta } from "./models/comment-meta.entity";
import { Comment } from "./models/comment.entity";
import { Links } from "./models/links.entity";
import { SitePost } from "./models/site-post.entity";
import { Term } from "./models/term.entity";
import { TermMeta } from "./models/term-meta.entity";
import { SiteOption } from "./models/site-option.entity";
export const CmsEntities = [
    Website,
    SitePage,
    CommentMeta,
    Comment,
    Links,
    SiteOption,
    SitePost,
    Term,
    TermMeta,
];
@Module({
    imports: [
        TypeOrmModule.forFeature(CmsEntities),
        CoreModule,
    ]
})
export class CmsModule { }
export {
    Website,
    SitePage,
    CommentMeta,
    Comment,
    Links,
    SiteOption,
    SitePost as Post,
    Term,
    TermMeta,
}