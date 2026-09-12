import { Component, OnInit, Injector, createNgModule } from '@angular/core';
import { AssistenteService } from './assistente.service';
import { CoreModule } from '@ci/core';
import { Subscription } from 'rxjs';
import { VoiceRecognitionService } from './recog.service';
import { Router, ROUTES, Routes } from '@angular/router';
@Component({
    selector: 'ci-assistente',
    templateUrl: './assistente.html',
    styleUrls: ['./assistente.scss'],
    standalone: true,
    imports: [
        CoreModule,
    ],
})
export class AssistenteComponent implements OnInit {
    isHovered = false;
    private commandSub!: Subscription;
    constructor(
        public voiceService: AssistenteService,
        protected readonly recog: VoiceRecognitionService,
        private router: Router,
        private injector: Injector,
    ) { }
    ngOnInit(): void {
        this.voiceService.init();
        this.commandSub = this.voiceService.commandSubject.subscribe(comando => {
            this.processarComando(comando);
        });
    }
    toggleListen(): void {
        if (this.voiceService.isListening) {
            this.voiceService.stop();
        } else {
            this.voiceService.start();
        }
    }
    async processarComando(comando: [string, string]) {
        this.voiceService.stop();
        try {
            setTimeout(() => {
                this.voiceService.stop();
            });
            // Verifica se o comando possui a ação "abrir "
            const indexAbrir = comando[0].indexOf('abrir ');
            if (indexAbrir !== -1) {
                // Extrai o termo que vem logo após o "abrir "
                const termoBusca = comando[0].substring(indexAbrir + 6).trim();
                if (termoBusca) {
                    await this.falar('Procurando por ' + termoBusca);
                    this.navegarParaRotaEquivalente(termoBusca);
                    return;
                }
            }
        } catch (error) {

        }
        setTimeout(() => {
            this.voiceService.text = '';
            this.voiceService.start();
        }, 200);
    }
    async falar(conteudo: string) {
        await this.recog.falar(conteudo);
        setTimeout(() => {
            this.voiceService.text = '';
            this.voiceService.start();
        }, 200);
    }
    private proccessing_navegarParaRotaEquivalente = false;
    private async navegarParaRotaEquivalente(termoBusca: string) {
        this.voiceService.stop();
        try {
            await this.falar('Carregando todas rotas');
            const rotasDisponiveis = await this.achatarRotas(this.router.config);
            console.log(rotasDisponiveis);
            await this.falar('Analisando as rotas disponíveis');
            let rotaEncontrada: string | null = null;
            for (const rota of rotasDisponiveis) {
                if (await this.rotaCorrespondeAoTermo(rota, termoBusca)) {
                    rotaEncontrada = rota.fullPath;
                    break; // Para no primeiro match encontrado
                }
            }
            if (rotaEncontrada) {
                await this.falar(`Navegando para: /${rotaEncontrada}`);
                this.router.navigate([`/${rotaEncontrada}`]);
            } else {
                await this.falar(`Nenhuma rota correspondente encontrada para: "${termoBusca}"`);
            }
        } catch (error) {

        }
        setTimeout(() => {
            this.voiceService.text = '';
            this.voiceService.start();
        }, 100);
    }
    private async rotaCorrespondeAoTermo(rota: { fullPath: string, data: any }, termoBusca: string) {
        // 1. Verifica se o nome do path corresponde
        if (rota.fullPath && this.normalizarTexto(rota.fullPath).includes(termoBusca)) {
            return true;
        }
        // 2. Verifica se algum campo de string dentro de 'data' corresponde
        if (rota.data) {
            for (const key in rota.data) {
                const valorData = rota.data[key];
                // Verifica se o valor é string e se o termo de busca está contido nela
                if (typeof valorData === 'string' && this.normalizarTexto(valorData).includes(termoBusca)) {
                    return true;
                }
            }
        }
        return false;
    }
    cached: any;
    private async achatarRotas(rotas: Routes, parentPath: string = ''): Promise<Array<{ fullPath: string, data: any }>> {

        let rotasPlanas: Array<{ fullPath: string, data: any }> = [];
        for (const rota of rotas) {
            // Ignora rotas de fallback
            if (rota.path === '**') continue;
            const pathAtual = rota.path ? rota.path : '';
            const fullPath = parentPath
                ? (pathAtual ? `${parentPath}/${pathAtual}` : parentPath)
                : pathAtual;
            rotasPlanas.push({ fullPath, data: rota.data });
            // 1. Consulta rotas filhas declaradas de forma síncrona
            if (rota.children && rota.children.length > 0) {
                const childrenPlanas = await this.achatarRotas(rota.children, fullPath);
                rotasPlanas = rotasPlanas.concat(childrenPlanas);
            }
            // 2. Consulta rotas filhas assíncronas (Lazy Loading)
            if (rota.loadChildren) {
                try {
                    // Executa a importação dinâmica
                    let loaded: any = await rota.loadChildren();
                    // Extrai o módulo real caso o import retorne um módulo ES encapsulado (default export)
                    if (loaded && loaded.default) {
                        loaded = loaded.default;
                    }
                    let rotasLazy: Routes = [];
                    // Cenário A: Standalone Components (retorna um array de rotas diretamente)
                    if (Array.isArray(loaded)) {
                        rotasLazy = loaded;
                    }
                    // Cenário B: NgModule Tradicional
                    else if (typeof loaded === 'function') {
                        try {
                            // Instancia o módulo lazy em memória usando o injetor atual
                            const moduleRef = createNgModule(loaded, this.injector);
                            // Extrai as rotas registradas por RouterModule.forChild(...)
                            // O token ROUTES retorna um array 2D (Array de Arrays de Rotas)
                            const rotasDoModulo = moduleRef.injector.get(ROUTES, []);
                            // Achata o array de rotas injetadas
                            rotasLazy = rotasDoModulo.reduce((acc, val) => acc.concat(val), []);
                        } catch (e) {
                            console.warn(`Não foi possível extrair rotas do módulo em: ${fullPath}`, e);
                        }
                    }
                    // Se conseguiu capturar as rotas de dentro do Lazy Module, continua a recursão
                    if (rotasLazy && rotasLazy.length > 0) {
                        const lazyPlanas = await this.achatarRotas(rotasLazy, fullPath);
                        rotasPlanas = rotasPlanas.concat(lazyPlanas);
                    }
                } catch (error) {
                    console.error(`Falha ao carregar a rota lazy: ${fullPath}`, error);
                }
            }
        }
        return rotasPlanas;
    }
    private normalizarTexto(texto: string): string {
        return texto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }
}