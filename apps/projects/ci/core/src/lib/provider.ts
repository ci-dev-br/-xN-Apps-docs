import { EnvironmentProviders, InjectionToken, isDevMode, makeEnvironmentProviders, Provider } from "@angular/core";
import { WsService } from "./io/ws.service";
import { NotificationService } from "./notification/notification.service";
import { UserService } from "@ci/auth";

export interface ICoreEnvironment {
    gateway?: string;
    rootApi?: string;
    alternativeApiGateways?: string[] | string,
}

export const CORE_ENV = new InjectionToken<ICoreEnvironment>('CI_CORE_ENV');

export function coreProvider(
    options: ICoreEnvironment
): EnvironmentProviders {
    if (isDevMode()) {
    }
    const providers: Provider[] = [
        WsService,
        UserService,
        NotificationService,
        { provide: CORE_ENV, useValue: options },
    ];
    return makeEnvironmentProviders(providers);
}