import { ModuleWithProviders, NgModule, isDevMode } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ApiModule } from "@portal/api";
import { AutoFocusDirective } from "./auto-focus.directive";
import { StorageService } from "./storage.service";
import { AuthorizationHttpInterceptor } from "./http.interceptor";
import { TokenService } from "./token.service";
import { PurePipe } from "./pure.pipe";
import { DaoService } from "./dao/dao.service";
import { ToolbarService } from "./services/toolbar.service";
import { NotificationService } from "./services/notification.service";
import { ServicesService } from "./services/services.service";
import { LocalizationService } from "./services/localization.service";

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
                ...(ApiModule.forRoot({
                    rootUrl: isDevMode() ?
                        'https://apps.ci.dev.br:446' : location.origin
                }).providers || []),
                StorageService,
                TokenService,
                DaoService,
                ToolbarService,
                NotificationService,
                ServicesService,
                LocalizationService,
                {
                    provide: HTTP_INTERCEPTORS, multi: true, useClass: AuthorizationHttpInterceptor
                },
            ]
        }
    }
}