import { IAppsInfo } from "./i-apps";

/**
 * Lista de Aplicativos carregados em tempo de compilação
 * 
 * A presença do aplicativo no tempo de execução não garante o acesso 
 * do usuários. Os aplicativos em tempo de compilação servem 
 * para aplicativos independentes de CNDApps. Para garantir uma execução
 * parcial dos sistemas para manutenção e desenvolvimento de recursos.
 *
 * Para disponibilizar os aplicativos por CNDApps, commite a branch em
 * https://git.plhx.com.br/[[SEU DEV_ID]]-at-[[nome-aplicacao]].git 
 * 
 * Essa aplicação ficará disponível no módulo de instalação
 */
export const Aplicativos: IAppsInfo[] = [
    /* {
        
    } */
];