import { Inject, Injectable, Optional } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { CI_ICON_PACK, IPack } from "./token";

@Injectable()
export class IconLoaderSerices {
    constructor(
        private readonly sz?: DomSanitizer,
        private readonly registry?: MatIconRegistry,
        @Optional() @Inject(CI_ICON_PACK) pack?: IPack | IPack[],
    ) { }

    async load(pack: IPack) {
        if (!this.sz) return;
        Object.keys(pack).forEach(p => {
            if (!this.sz || !this.registry) return;
            const icon = pack[p];
            const url = this.sz.bypassSecurityTrustResourceUrl(icon.url);
            this.registry.addSvgIcon(p, url);
        })
    }
}