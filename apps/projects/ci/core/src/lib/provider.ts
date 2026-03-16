import { EnvironmentProviders, InjectionToken, isDevMode, LOCALE_ID, makeEnvironmentProviders, Provider, Type } from "@angular/core";
import { WsService } from "./io/ws.service";
import { NotificationService } from "./notification/notification.service";
import { AuthUserService } from "@ci/auth";
import { ShortcutService } from "./services/shortcut.service";
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from "@angular/common";
registerLocaleData(localePt, 'pt-BR');

export interface ISchemaPreset<T, D> {
    primary?: string | string[];
    schemaName?: string;
    service?: Type<T>,
    get?: (service: T, ...args: any) => Promise<D[]>;
    sync?: (service: T, ...args: any) => Promise<D>;
}
export interface ICoreEnvironment {
    gateway?: string;
    rootApi?: string;
    alternativeApiGateways?: string[] | string,
    servicesCommons?: [
        ISchemaPreset<any, any>
    ]
}
export const CORE_ENV = new InjectionToken<ICoreEnvironment>('CI_CORE_ENV');
export function coreProvider(
    options: ICoreEnvironment
): EnvironmentProviders {
    if (isDevMode()) {
    }
    const providers: Provider[] = [
        WsService,
        AuthUserService,
        NotificationService,
        ShortcutService,
        { provide: CORE_ENV, useValue: options },
        { provide: LOCALE_ID, useValue: 'pt-BR' }
    ];
    return makeEnvironmentProviders(providers);
}