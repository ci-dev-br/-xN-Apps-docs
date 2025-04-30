import { Component, Input, OnInit } from "@angular/core";
import { UserService } from "@ci/auth";
import { Prancheta, PranchetaService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";

@Component({
    selector: 'ci-board',
    template: `
        <div class="board-wrap">
            <h1>{{prancheta?.title}}</h1>
        </div>
    `,
    styleUrls: [
        'board.component.scss',
    ],
    standalone: false,
})
export class BoardComponent implements OnInit {
    @Input() default?: string;
    constructor(
        private readonly user: UserService,
        private readonly pranchetas: PranchetaService
    ) { }
    async ngOnInit() {
        this.loadBoard();
    }
    prancheta?: Prancheta;
    async loadBoard() {
        this.prancheta = await lastValueFrom(
            this.pranchetas.pranchetaControllerGet({ body: { defaultGlobalCode: this.default } })
        );

        if (!this.prancheta && !!this.default && ((this.user?.user?.value?.roles || []).indexOf('MASTER') > -1)) {
            this.prancheta = {
                codigoGlobal: ((this.user?.user?.value?.roles || []).indexOf('MASTER') > -1) ? this.default : undefined,
            };
            await lastValueFrom(
                this.pranchetas.pranchetaControllerSync({ body: { prancheta: this.prancheta } })
            )
        } else {
            // if (!!this.default) {
            //     this.pranchetas.pranchetaControllerGet({ body: { defaultGlobalCode: this.default } });
            // }
        }
    }
}