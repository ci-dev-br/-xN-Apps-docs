

import { FullAuditedEntity } from "@ci/core";
import { Entity } from "typeorm";
import { schema } from "./schema";

@Entity({
    schema
})
export class CodigoFonte extends FullAuditedEntity {

}