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
        setTimeout(() => {
            this.voiceService.start();
        })
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

            const comandoTexto = comando[0].toLowerCase();

            // 1. Verifica se o comando possui a ação "abrir "
            const indexAbrir = comandoTexto.indexOf('abrir ');
            if (indexAbrir !== -1) {
                const termoBusca = comandoTexto.substring(indexAbrir + 6).trim();
                if (termoBusca) {
                    await this.falar('Procurando por ' + termoBusca);
                    this.navegarParaRotaEquivalente(termoBusca);
                    return;
                }
            }

            // 2. Verifica se o comando possui a ação "clicar "
            const termo = 'clicar em';
            const indexClicar = this.normalizarTexto(comandoTexto).indexOf(termo);
            if (indexClicar !== -1) {
                const termoBusca = comandoTexto.substring(indexClicar + termo.length).trim();
                if (termoBusca) {
                    await this.clicarEmElemento(termoBusca);
                    return;
                }
            }

        } catch (error) {
            console.error('Erro ao processar comando:', error);
        }

        setTimeout(() => {
            this.voiceService.text = '';
            this.voiceService.start();
        }, 200);
    }

    async falar(conteudo: string) {
        try {
            await this.recog.falar(conteudo);
            setTimeout(() => {
                this.voiceService.text = '';
                this.voiceService.start();
            }, 200);
        } catch (error) {
            console.error('Erro no reconhecimento de voz:', error);
        }
    }

    // --- NOVA FUNCIONALIDADE: CLICAR ---
    private async clicarEmElemento(termoBusca: string) {
        this.voiceService.stop();
        try {
            await this.falar('Procurando para clicar em ' + termoBusca);

            const elemento = this.encontrarElementoClicavel(termoBusca);

            if (elemento) {
                await this.falar(`Clicando em ${termoBusca}`);
                elemento.click();
            } else {
                await this.falar(`Não encontrei nada para clicar com o termo ${termoBusca}`);
            }
        } catch (error) {
            console.error('Erro ao tentar clicar:', error);
        }

        setTimeout(() => {
            this.voiceService.text = '';
            this.voiceService.start();
        }, 200);
    }

    private encontrarElementoClicavel(termoBusca: string): HTMLElement | null {
        const termo = this.normalizarTexto(termoBusca);

        // Prioriza elementos que normalmente recebem interações
        const seletoresInterativos = 'button, a, input[type="button"], input[type="submit"], [role="button"], [role="link"], mat-list-item, .clickable, .btn';
        const elementosInterativos = Array.from(document.querySelectorAll<HTMLElement>(seletoresInterativos));

        for (const el of elementosInterativos) {
            const texto = this.normalizarTexto(el.innerText || el.getAttribute('aria-label') || el.title || el.getAttribute('value') || '');
            if (texto.includes(termo) && this.elementoEstaVisivel(el)) {
                return el;
            }
        }

        // Fallback: varre todo o DOM.
        // O reverse() ajuda a pegar os nós mais profundos (filhos) antes dos containers pais grandes.
        const todosElementos = Array.from(document.querySelectorAll<HTMLElement>('*'));
        for (const el of todosElementos.reverse()) {
            // Para não clicar no body/html se o termo for muito genérico
            if (['HTML', 'BODY', 'MAIN', 'APP-ROOT'].includes(el.tagName)) continue;

            const texto = this.normalizarTexto(el.innerText || '');
            if (texto.includes(termo) && this.elementoEstaVisivel(el)) {
                return el;
            }
        }

        return null;
    }

    private elementoEstaVisivel(el: HTMLElement): boolean {
        // Verifica se o elemento tem dimensão física renderizada na tela
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    }
    // -----------------------------------

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
            console.error('Erro ao navegar:', error);
        }
        setTimeout(() => {
            this.voiceService.text = '';
            this.voiceService.start();
        }, 100);
    }

    private async rotaCorrespondeAoTermo(rota: { fullPath: string, data: any }, termoBusca: string) {
        if (rota.fullPath && this.normalizarTexto(rota.fullPath).includes(termoBusca)) {
            return true;
        }
        if (rota.data) {
            for (const key in rota.data) {
                const valorData = rota.data[key];
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
            if (rota.path === '**') continue;

            const pathAtual = rota.path ? rota.path : '';
            const fullPath = parentPath
                ? (pathAtual ? `${parentPath}/${pathAtual}` : parentPath)
                : pathAtual;

            rotasPlanas.push({ fullPath, data: rota.data });

            if (rota.children && rota.children.length > 0) {
                const childrenPlanas = await this.achatarRotas(rota.children, fullPath);
                rotasPlanas = rotasPlanas.concat(childrenPlanas);
            }

            if (rota.loadChildren) {
                try {
                    let loaded: any = await rota.loadChildren();
                    if (loaded && loaded.default) {
                        loaded = loaded.default;
                    }
                    let rotasLazy: Routes = [];
                    if (Array.isArray(loaded)) {
                        rotasLazy = loaded;
                    } else if (typeof loaded === 'function') {
                        try {
                            const moduleRef = createNgModule(loaded, this.injector);
                            const rotasDoModulo = moduleRef.injector.get(ROUTES, []);
                            rotasLazy = rotasDoModulo.reduce((acc, val) => acc.concat(val), []);
                        } catch (e) {
                            console.warn(`Não foi possível extrair rotas do módulo em: ${fullPath}`, e);
                        }
                    }
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
        if (!texto) return '';
        return texto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }
}