import { ModuleWithProviders, NgModule } from "@angular/core";
import { PurePipe } from "./pure.pipe";
import { CommonModule } from "@angular/common";
import { AutoFocusDirective } from "./auto-focus.directive";
import { StorageService } from "./storage.service";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { AuthorizationHttpInterceptor } from "./http.interceptor";

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
                StorageService,
                {
                    provide: HTTP_INTERCEPTORS, multi: true, useClass: AuthorizationHttpInterceptor, deps: [StorageService]
                },
            ]
        }
    }
}