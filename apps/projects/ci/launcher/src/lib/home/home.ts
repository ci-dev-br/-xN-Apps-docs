import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@ci/core';

@Component({
  selector: 'ci-Home  ',
  imports: [
    CoreModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatTooltipModule,
  ],
  templateUrl: `home.html`,
  styleUrl: `home.scss`,
})
export class Home implements OnInit {
  locked = true;
  ngOnInit(): void {
  }
  localApps = [
  ]
  get time() { return new Date() }
  barApps = [
    { icon: 'video_camera_back_add', name: 'Registrar momento', onClick: () => this.criarMomento() },
    { icon: 'phone', name: 'Ligações', onClick: () => this.criarLigacao() },
    { icon: 'add_notes', name: 'Anotações', onClick: () => this.criarAnotacao() },
  ];
  msg = 'desbloquear'
  unlock() {
    if (this.msg === 'desbloquear') {
      setTimeout(() => {
        this.msg = '... mais uma vez';
      }, 350);
    } else if ('... mais uma vez' === this.msg) {
      setTimeout(() => {
        this.msg = 'ultima vez';
      }, 350);
    } else if ('ultima vez' === this.msg) {
      this.msg = 'aguarde para confirmação... clique para reiniciar';
      setTimeout(() => {
        this.locked = false;
      }, 1350);
    } else {
      //setTimeout(() => {
      this.locked = true;
      this.msg = 'desbloquear'
      // }, 1000);
    }
  }
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient,
    private readonly dialog: MatDialog,
  ) {

    // is browser ?
    if (isPlatformBrowser(this.platformId)) {
      // Código específico para o navegador



    }
  }
  @HostListener('window:mousemove', ['$event'])
  async onMouseMove(event: MouseEvent) {
    // TODO: implementar estratégia para realizar o bloquei da tela em caso inatividade do usuário, como por exemplo, utilizando o evento de mousemove para resetar um timer que bloqueia a tela após um período de inatividade.
  }
  async criarAnotacao() {
    // this.dialog.open(/* AnotacaoDialogComponent */, {
    //   data: { title: 'Nova Anotação' }
    // });
  }
  async criarLigacao() {
    // this.dialog.open(/* LigacaoDialogComponent */, {
    // data: { title: 'Nova Ligação' }
    // });
  }
  async criarMomento() {
    // this.dialog.open(/* MomentoDialogComponent */, {
    // data: { title: 'Novo Momento' }
    // });
  }
}
