import { Injectable, OnInit, Optional } from "@angular/core";
import { IThemeOptions } from "./i-theme-options";
import { of } from "rxjs";
import { WindowService } from "@ci/components/window";

@Injectable()
export class ThemeService implements OnInit {
    constructor(
        // @Optional() private readonly windows: WindowService,
    ) {

    }
    ngOnInit(): void {
        /* this.windows?.addEventListener('log', (...args) => {
            alert(...args)
        }) */
    }
    async updateThemeOptions(themeOptions: IThemeOptions) {

    }
    get mode$() {
        return of('os');
    }

    obterListaTemas() {

    }
}