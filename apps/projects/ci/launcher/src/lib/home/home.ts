import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { BoardModule } from '@ci/components';
import { CoreModule } from '@ci/core';

@Component({
  selector: 'ci-Home  ',
  imports: [
    CoreModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatTooltipModule,
    //  BoardModule,
    // ThrejsComponent,
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
    { icon: 'video_camera_back_add', name: 'Registrar momento' },
    { icon: 'phone', name: 'Ligações' },
    { icon: 'add_notes', name: 'Anotações' },
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
}
