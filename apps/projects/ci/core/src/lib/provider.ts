import { EnvironmentProviders, isDevMode, makeEnvironmentProviders, Provider } from "@angular/core";
import { WsService } from "./io/ws.service";


export interface ICoreEnvironment {
    gateway?: string;
}

export function coreProvider(
    options: ICoreEnvironment
): EnvironmentProviders {
    if (isDevMode()) {
    }
    const providers: Provider[] = [
        WsService,
    ];
    return makeEnvironmentProviders(providers);
}