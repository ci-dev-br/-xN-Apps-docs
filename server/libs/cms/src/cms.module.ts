import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CoreModule } from "@ci/core/core.module";
import { Website } from './models/website.entity';
import { SitePage } from "./models/site-page.entity";
import { CommentMeta } from "./models/comment-meta.entity";
import { Comment } from "./models/comment.entity";
import { Links } from "./models/links.entity";
import { SitePost } from "./models/site-post.entity";
import { Term } from "./models/term.entity";
import { TermMeta } from "./models/term-meta.entity";
import { SiteOption } from "./models/site-option.entity";
import { WebsiteController } from "./controllers/website.controller";
import { SitePageController } from "./controllers/site-page.controller";
import { CommentMetaController } from "./controllers/comment-meta.controller";
import { LinksController } from "./controllers/links.controller";
import { SiteOptionController } from "./controllers/site-option.controller";
import { SitePostController } from "./controllers/site-post.controller";
import { TermController } from "./controllers/term.controller";
import { TermMetaController } from "./controllers/term-meta.controller";
import { CommentController } from "./controllers/comment.controller";
import { WebsiteService } from "./services/website.service";
import { SitePageService } from "./services/site-page.service";
import { CommentMetaService } from "./services/comment-meta.service";
import { CommentService } from "./services/comment.service";
import { LinksService } from "./services/links.service";
import { SiteOptionService } from "./services/site-option.service";
import { SitePostService } from "./services/site-post.service";
import { TermService } from "./services/term.service";
import { TermMetaService } from "./services/term-meta.service";
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
    ],
    controllers: [
        WebsiteController,
        SitePageController,
        CommentMetaController,
        CommentController,
        LinksController,
        SiteOptionController,
        SitePostController,
        TermController,
        TermMetaController,
    ],
    providers: [
        WebsiteService,
        SitePageService,
        CommentMetaService,
        CommentService,
        LinksService,
        SiteOptionService,
        SitePostService,
        TermService,
        TermMetaService,
    ],
    exports: [
        WebsiteService,
        SitePageService,
        CommentMetaService,
        CommentService,
        LinksService,
        SiteOptionService,
        SitePostService,
        TermService,
        TermMetaService,
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