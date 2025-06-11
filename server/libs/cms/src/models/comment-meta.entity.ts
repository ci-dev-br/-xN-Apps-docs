import { Entity } from "typeorm";
import { schema } from "./schema";
import { FullAuditedEntity } from "@ci/manager";


@Entity({ schema })
export class CommentMeta extends FullAuditedEntity{ 
    // TODO: revisar taxonomia do wordpress e adaptar ao contexto de tenants e multi-tenant

}