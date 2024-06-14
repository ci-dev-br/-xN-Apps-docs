import { Injectable } from "@angular/core";
import { OrganizacaoService as APIOrganizacaoService, Organizacao } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";
@Injectable()
export class OrganizacaoService {
    currentOrganization?: Organizacao
    constructor(
        private readonly api: APIOrganizacaoService,
    ) {
        this.load();
    }
    async load() {
        // this.currentOrganization = await lastValueFrom(this.api.organizacaoGetCurrent());
    }
}