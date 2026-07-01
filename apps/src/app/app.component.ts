import { Component, createNgModule, HostListener, Injector, isDevMode, OnDestroy, OnInit, Optional } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Route, Router, RouterModule, RouterOutlet, ROUTES } from '@angular/router';
import { WindowModule, WindowService } from '@ci/components/window';
import { CoreModule, CoreService, WsService } from '@ci/core';
import { ApplicationService } from '@ci/portal-api';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
export interface RouteMetadata {
  fullPath: string;
  title?: string;
  //  date?: string;
  [key: string]: any;
}
@Component({
  selector: 'ci-root',
  standalone: true,
  imports: [
    CoreModule,
    RouterOutlet,
    MatIconModule,
    RouterModule,
    WindowModule,
    MatSnackBarModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  load = new BehaviorSubject<boolean>(true);
  isDevMode = isDevMode();
  title = 'apps';
  constructor(
    private injector: Injector,
    @Optional() private readonly matIconReg?: MatIconRegistry,
    @Optional() private readonly core?: CoreService,
    // @Optional() private readonly router: Router, 
    // // TODO: mover controle ativo de rota para camapra Core Init;
    // @Optional() private readonly websocket: WsService,
    //  // TODO: mover Web Seocket para Core Init;
    @Optional() private readonly window?: WindowService,
    @Optional() private readonly snack?: MatSnackBar,
    @Optional() private readonly router?: Router,
    @Optional() private readonly apps?: ApplicationService,
  ) {
    // This variable will save the event for later use.
    // let deferredPrompt;
    /* window.addEventListener('beforeinstallprompt', (e) => {
      // Prevents the default mini-infobar or install dialog from appearing on mobile
      // e.preventDefault();
      // Save the event because you'll need to trigger it later.
      // deferredPrompt = e;
      // Show your customized install prompt for your PWA
      // Your own UI doesn't have to be a single element, you
      // can have buttons in different locations, or wait to prompt
      // as part of a critical journey.
      // showInAppInstallPromotion();
    }); */
  }
  ngOnDestroy(): void {
  }
  ngOnInit() {
    this.preparePreloadedApplication();
    this.core?.init();
    this.matIconReg?.setDefaultFontSetClass('material-symbols-sharp');
    // this.router.events.subscribe(r => console.log(r))
    // This variable will save the event for later use.
    let deferredPrompt;
    if (typeof window !== 'undefined') {
      this.load.next(false);
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        // Prevents the default mini-infobar or install dialog from appearing on mobile
        // Save the event because you'll need to trigger it later.
        // Show your customized install prompt for your PWA
        // Your own UI doesn't have to be a single element, you
        // can have buttons in different locations, or wait to prompt
        // as part of a critical journey.
        // showInAppInstallPromotion();
      });
    }
    // this.worker();
    this.window?.addEventListener('log', (...args) => {
      this.snack?.open(String(args), 'De acordo')
    })
    this.window?.addEventListener('error', (...args) => {
      this.snack?.open(String(args), 'De acordo')
    })
    this.window?.addEventListener('warn', (...args) => {
      this.snack?.open(String(args), 'De acordo')
    })
    this.window?.addEventListener('info', (...args) => {
      this.snack?.open(String(args), 'De acordo')
    })
  }
  private showInAppInstallPromotion() {
    alert("Gostando da experiência? Tenha tudo na palma da sua mão com o nosso app.");
  }
  private worker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register("https://apps.ci.dev.br/sw.js");
    }
  }
  @HostListener('window:keydown', ['$event'])
  keyDownHandler(event: KeyboardEvent) {
    // disabled user force reload page ... 
    if (event.code === 'F5' || (event.code === 'KeyR' && event.ctrlKey)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
  async preparePreloadedApplication() {
    // if (isDevMode()) {
    let current_apps = await lastValueFrom(this.apps!.getList({ body: { all: true } }));
    let routes_on_build = await this.extractRecursively(this.router!.config, '');
    routes_on_build = routes_on_build;
    /* current_apps.filter(app => {
      app.name
    }) */
    // }
  }

  /**
   * Função recursiva para varrer rotas filhas lazy e não-lazy
   */
  private async extractRecursively(routes: Route[], parentPath: string): Promise<RouteMetadata[]> {
    const extracted: RouteMetadata[] = [];

    for (const route of routes) {
      // 1. Monta o caminho acumulado
      const currentSegment = route.path?.length! > 0 ? `/${route.path}` : '';
      const fullPath = `${parentPath}${currentSegment}`.replace(/\/\//g, '/');

      // 2. Extrai os dados se existirem
      if (route.data && route.data['title']) {
        extracted.push({
          fullPath,
          title: route.data['title'],
          // date: route.data['date'],
          ...route.data
        });
      }

      // 3. Sub-rotas estáticas (children não-lazy)
      if (route.children && route.children.length > 0) {
        const childrenMeta = await this.extractRecursively(route.children, fullPath);
        extracted.push(...childrenMeta);
      }

      // 4. Sub-rotas dinâmicas (loadChildren)
      if (route.loadChildren) {
        try {
          // Dispara o download/resolução do chunk
          const loadedContent = await (route.loadChildren as any)();
          let childRoutes: Route[] = [];

          if (Array.isArray(loadedContent)) {
            // [CENÁRIO 1] Standalone Components: Retorna Route[] diretamente
            childRoutes = loadedContent;

          } else {
            // [CENÁRIO 2] NgModule Legado: Retorna uma classe do tipo NgModule

            // Instancia o módulo dinamicamente para ter acesso ao Injector dele
            const moduleRef = createNgModule(loadedContent, this.injector);

            // Pede ao Injector do módulo a lista de rotas. 
            // O token ROUTES retorna um array de arrays (Route[][]) 
            // devido à forma como o RouterModule.forChild funciona.
            const routesInModule = moduleRef.injector.get(ROUTES, []);

            // Achata o array de arrays (Route[][]) para um array simples (Route[])
            childRoutes = routesInModule.flat();
          }

          // Continua a recursão nos filhos encontrados
          if (childRoutes && childRoutes.length > 0) {
            const lazyChildrenMeta = await this.extractRecursively(childRoutes, fullPath);
            extracted.push(...lazyChildrenMeta);
          }

        } catch (error) {
          console.error(`Falha ao carregar e extrair a rota lazy em ${fullPath}`, error);
        }
      }
    }

    return extracted;
  }
}
