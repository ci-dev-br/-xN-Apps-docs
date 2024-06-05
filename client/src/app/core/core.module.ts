import { ModuleWithProviders, NgModule, isDevMode } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, HttpClientModule } from "@angular/common/http";
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
import { TranslateDirective } from "./i18n/translate.directive";

@NgModule({ declarations: [
        PurePipe,
        AutoFocusDirective,
    ],
    exports: [
        PurePipe,
        CommonModule,
        HttpClientModule,
        AutoFocusDirective,
        TranslateDirective,
    ], imports: [CommonModule,
        TranslateDirective], providers: [
        provideHttpClient(withInterceptorsFromDi())
    ] })
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