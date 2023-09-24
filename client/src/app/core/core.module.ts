import { ModuleWithProviders, NgModule, isDevMode } from "@angular/core";
import { PurePipe } from "./pure.pipe";
import { CommonModule } from "@angular/common";
import { AutoFocusDirective } from "./auto-focus.directive";
import { StorageService } from "./storage.service";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { AuthorizationHttpInterceptor } from "./http.interceptor";
import { TokenService } from "./token.service";
import { ApiModule } from "../api/api.module";

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
    ],
    declarations: [
        PurePipe,
        AutoFocusDirective,
    ],
    providers: [
    ],
    exports: [
        PurePipe,
        CommonModule,
        HttpClientModule,
        AutoFocusDirective,
    ]
})
export class CoreModule {
    public static forRoot(): ModuleWithProviders<CoreModule> {
        return {
            ngModule: CoreModule,
            providers: [
                ...(ApiModule.forRoot({ rootUrl: isDevMode() ? 'https://npm.plhx.com.br:3090' : location.origin }).providers || []),
                StorageService,
                TokenService,
                {
                    provide: HTTP_INTERCEPTORS, multi: true, useClass: AuthorizationHttpInterceptor
                },
            ]
        }
    }
}