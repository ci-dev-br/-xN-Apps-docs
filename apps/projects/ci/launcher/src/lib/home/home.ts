import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { UserAuthenticationService } from '@ci/auth';
import { BoardModule } from '@ci/components';
import { CoreModule } from '@ci/core';
import { Objeto, Player, ThrejsComponent } from '@ci/espazio';
export interface Widget {
  id: string;
  type: 'greeting' | 'tile' | 'sensor' | 'pill-status' | 'pill-action';
  // Configuração para ícones e cores
  icon?: string;
  iconBgColor?: string; // Ex: o círculo vermelho atrás do microfone
  iconColor?: string;
  // Textos
  title?: string;       // Texto principal
  subtitle?: string;    // Texto secundário (descrição)
  metaValue?: string;   // Ex: '1,250.00' ou '94%'
  metaUnit?: string;    // Ex: '$', '%'
  timestamp?: string;   // Ex: '12:00 PM'
  // Comportamento
  actionRoute?: string;
  gridClass?: string;   // Controla o tamanho (ex: 'col-2', 'col-4')
}
export interface AppItem {
  id: string;
  name: string;
  icon: string;
  route: string;
  bgColor: string;
  iconColor: string;
}
@Component({
  selector: 'ci-Home  ',
  imports: [
    CoreModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    BoardModule,
    ThrejsComponent,
  ],
  templateUrl: `home.html`,
  styleUrl: `home.scss`,
})
export class Home implements OnInit {
  // Lista de "aplicativos" do seu launcher
  apps: AppItem[] = [
    { id: '1', name: 'Dashboard', icon: 'dashboard', route: '/dash', bgColor: '#e3f2fd', iconColor: '#1976d2' },
    { id: '2', name: 'Análises', icon: 'bar_chart', route: '/analytics', bgColor: '#fce4ec', iconColor: '#c2185b' },
    { id: '3', name: 'Mensagens', icon: 'chat', route: '/messages', bgColor: '#e8f5e9', iconColor: '#388e3c' },
    { id: '4', name: 'Carteira', icon: 'account_balance_wallet', route: '/wallet', bgColor: '#e0f7fa', iconColor: '#0097a7' },
    { id: '5', name: 'Tarefas', icon: 'check_circle', route: '/tasks', bgColor: '#fff3e0', iconColor: '#f57c00' },
    { id: '6', name: 'Perfil', icon: 'person', route: '/profile', bgColor: '#f3e5f5', iconColor: '#7b1fa2' },
    { id: '7', name: 'Suporte', icon: 'help_outline', route: '/support', bgColor: '#eceff1', iconColor: '#455a64' },
    { id: '8', name: 'Ajustes', icon: 'settings', route: '/settings', bgColor: '#f5f5f5', iconColor: '#616161' },
  ];

  widgets: Widget[] = [
    // Header (Greeting)
    /*  {
       id: 'h1', type: 'greeting',
       title: 'PREMIUM LAUNCHER',
       subtitle: 'Sistema Operacional Modular. Estabilidade: Alta.'
     }, */
    // Pill Status (Topo)
    { id: 'ps1', type: 'pill-status', title: 'DASHBOARD / MAI 2026' },

    // Grid de Widgets Modulares (Seção Central)
    // Sensor Data (adaptado da imagem: bloco branco/preto com dots)
    {
      id: 's1', type: 'sensor',
      title: 'Real-Time Metrics',
      metaValue: '21.5', metaUnit: '°C',
      subtitle: '65% RH | 400 PPM',
      gridClass: 'col-4' // Ocupa a largura total na grid interna
    },
    // Tile: Performance (Exemplo)
    {
      id: 't1', type: 'tile', icon: 'trending_up', title: 'Performance', subtitle: 'Matriz de Dados',
      iconColor: '#ff2d2d',
      actionRoute: '/perf', gridClass: 'col-2'
    },
    // Tile: Communications (Exemplo)
    {
      id: 't2', type: 'tile', icon: 'mail', title: 'Comms', subtitle: 'Canal Ativo',
      iconColor: '#ff2d2d',
      actionRoute: '/comms', gridClass: 'col-2'
    },
    // Tile: Wallet (Exemplo - adaptado para metaValue)
    {
      id: 't3', type: 'tile', icon: 'account_balance_wallet', title: 'Carteira', metaValue: '$ 1,250.00',
      iconColor: '#ff2d2d',
      actionRoute: '/wallet', gridClass: 'col-2'
    },
    // Tile: Global Settings (Exemplo)
    {
      id: 't4', type: 'tile', icon: 'settings', title: 'Ajustes', subtitle: 'Config. Globais',
      iconColor: '#ff2d2d',
      actionRoute: '/settings', gridClass: 'col-2'
    },
    // Quick Nav Area (adaptado: Tile com círculo de ação e pergunta)
    {
      id: 'qn1', type: 'tile', icon: 'mic',
      iconBgColor: '#ff2d2d', // Fundo vermelho do círculo
      iconColor: '#000000',   // Ícone preto no fundo vermelho
      title: 'Como posso ajudar?',
      subtitle: 'Microfone Ativo',
      actionRoute: '/assist', gridClass: 'col-4'
    },

    // Ações Rápidas (Formato Pill inferior)
    { id: 'a1', type: 'pill-action', icon: 'near_me', title: 'Navegação Rápida', actionRoute: '/nav' },
    { id: 'a2', type: 'pill-action', icon: 'grid_view', title: 'Dashboard Hub', actionRoute: '/dash' },
    { id: 'a3', type: 'pill-action', icon: 'place', title: 'Geolocalização', actionRoute: '/geo' },
    // Botão de Ação Global (Pill Vermelha)
    { id: 'a4', type: 'pill-action', title: 'EXECUTAR AÇÃO', gridClass: 'pill-primary' }
  ];

  openApp(app: AppItem): void {
    console.log(`Navegando para: ${app.route}`);
    // Aqui você injetaria o Router e usaria: this.router.navigate([app.route]);
  }

  onWidgetClick(widget: Widget): void {
    if (widget.actionRoute) {
      console.log(`Navegando para: ${widget.actionRoute}`);
      // this.router.navigate([widget.actionRoute]);
    }
  }
  g = [
    // TODO: Carregar papéis de parede do usuário...
    /*  'https://images.pexels.com/photos/33258471/pexels-photo-33258471.jpeg',
     'https://images.pexels.com/photos/33869022/pexels-photo-33869022.jpeg',
     'https://images.pexels.com/photos/34234277/pexels-photo-34234277.png',
     'https://images.pexels.com/photos/6009490/pexels-photo-6009490.jpeg',
     'https://images.pexels.com/photos/11394988/pexels-photo-11394988.jpeg',
     'https://images.pexels.com/photos/34442367/pexels-photo-34442367.jpeg', */
  ];
  tiger?: Objeto;
  objetos: Objeto[] = [
    this.tiger = new Player({
      glb_file: 'tiger.glb',
    }),
    new Objeto({
      glb_file: 'map_01.glb',
    }),
  ];
  @HostListener('window:keydown', ['$event'])
  async keyDownHandler(event: KeyboardEvent) {
    let move = false;
    if (event.code === 'KeyW') {
      if (typeof this?.tiger?.gltf?.scene?.position.x === 'number') {
        this.tiger.gltf.scene.position.z += 0.1;
        move = true;
      }
    }
    if (event.code === 'KeyS') {
      if (typeof this?.tiger?.gltf?.scene?.position.x === 'number') {
        this.tiger.gltf.scene.position.z -= 0.1;
        move = true;
      }
    }
    if (event.code === 'KeyD') {
      if (typeof this.tiger?.gltf?.scene?.rotation.x === 'number') {
        this.tiger.gltf.scene.rotation.y -= 0.1;
      }
    }
    if (event.code === 'KeyA') {
      if (typeof this.tiger?.gltf?.scene?.rotation.x === 'number') {
        this.tiger.gltf.scene.rotation.y += 0.1;
      }
    }
    if (move === false) {
      this.tiger?.gltf?.animations[5].play();
    } else {
      this.tiger?.gltf?.animations[5].stop();
    }
  }
  x?: string;
  agora = new Date();
  n?: string;
  segundos?: string = ('0' + ((new Date()).getSeconds().toFixed())).substr(-2);
  y?: string;
  lapse: number = 0;
  t = false;
  ngOnInit(): void {
    this.agora = new Date();
    this.updateTime();
  }
  isBrowser: boolean;
  isDeveloper?: boolean;
  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly authUser: UserAuthenticationService,
  ) {
    this.load();
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      authUser.user.subscribe(user => {
        if (user!.roles!.indexOf('DEVELOPER') !== -1) {
          this.isDeveloper = true;
        }
      })
    }
  }
  async updateTime() {
    let o = this.n || 0;
    this.n = (Date.now()).toString().substr(-3);
    try {
      this.lapse = Number(((Number(this.n) || 0) / 100).toFixed().substr(-1));
    } catch (error) { }
    setTimeout(() => { this.updateTime() }, 100);
    try {
      if (this.lapse !== 0) {
        if (!!this.t) this.t = false;
        return;
      }
      if (!this.t) {
        let os = ('0' + (new Date()).getSeconds()).substr(-2);
        if (os !== this.segundos) {
          this.t = true;
          this.segundos = os;
        }
        if (this.segundos === '00') {
          this.agora = new Date();
        }
      }
    } catch (error) {

    }
  }
  async load() {
    // removidor temporariamente: Esta provocando travamento no contador.
    let a = this.g[Math.round(Math.random() * (this.g.length - 1))];
    //  this.http
    fetch('' + a).then((r) => {
      if (r.status === 200) {
        this.x = a;
        a = this.g[Math.round(Math.random() * (this.g.length - 1))];
      } else {
        this.load();
      }
    })
  }
  async toggleEnv() {
    if (this.authUser.user.value!.roles!.indexOf('DEVELOPER') > -1) {
      location.href = location.href.indexOf('apps.') > -1 ? location.href.replace('apps.', 'development.') : location.href.replace('development.', 'apps.');
    }
  }
}
