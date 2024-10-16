import { Injectable } from "@angular/core";
import { IThemeOptions } from "./i-theme-options";
import { of } from "rxjs";

@Injectable()
export class ThemeService {
    async updateThemeOptions(themeOptions: IThemeOptions) {

    }
    get mode$() {
        return of('os');
    }

    obterListaTemas() {

    }
}