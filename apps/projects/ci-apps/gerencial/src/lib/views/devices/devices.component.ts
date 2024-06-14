import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { NgxQRCodeModule } from '@jonyadamit/ngx-qrcode-ivy';
import { CoreModule } from '@ci/core';

@Component({
    selector: 'ci-devices',
    template: `
         <mat-toolbar>
            <button mat-raised-button (click)="conectarDispositivo()">
                <mat-icon>smartphone</mat-icon>
                Conectar Dispositivo
            </button>
            <button mat-raised-button >
                <mat-icon>travel_explore</mat-icon>
                Procurar Dispositivo
            </button>
            <button mat-raised-button (click)="openFakeMobileService()" >
                <mat-icon>phone_android</mat-icon>
                Fake Mobile Services
            </button>
        </mat-toolbar>
        <div style="display: flex; flex-direction: column;align-items: center;justify-content: center;">
            <small>Nenhum dispositivo conectado...</small>
            <ngx-qrcode [value]="token">
            </ngx-qrcode>
            <small>Leia o QRCode com o aplicativo para celular para conectar o aparelho aos serviços.</small>
        </div> 
    `,
    standalone: true,
    imports: [
        CoreModule,
        MatToolbarModule,
        NgxQRCodeModule,
        MatIconModule,
        MatButtonModule,
    ]
}) export class DevicesComponent {
    conectarDispositivo() { }
    token = 'n2n34u5ifbn2uio34bhf2u34ybf2uy4b5fouy2b45f';
    async openFakeMobileService() {
        window.open(location.origin + '/gerencial/mob-fake', 'teste' + Math.random().toString(32).substring(5).toUpperCase(), 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=350,height=600,left=-1000,top=-1000');
    }
}