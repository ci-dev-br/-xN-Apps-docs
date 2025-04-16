import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { NgxQRCodeModule } from '@jonyadamit/ngx-qrcode-ivy';
import { CoreModule } from '@ci/core';
import { Device, DeviceService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";

@Component({
    selector: 'ci-devices',
    template: `
        <style>
            .device{
                width: 160px;
                height: 300px;
                background: black;
                border-radius: 14px;
                box-shadow: 3px 6px 4px rgba(0,0,0,.455);
            }
            .devices{
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: 48px;
                padding: 48px;
            }
        </style>
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
        @if(!devices){<div style="display: flex; flex-direction: column;align-items: center;justify-content: center;">
            <small>Nenhum dispositivo conectado...</small>
            <ngx-qrcode [value]="token">
            </ngx-qrcode>
            <small>Leia o QRCode com o aplicativo para celular para conectar o aparelho aos serviços.</small>
        </div> } @else {
           <div class="devices" > @for(device of devices; track device){
                <div class="device" >{{device.mac}}</div>
            } </div>
        }
    `,
    imports: [
        CoreModule,
        MatToolbarModule,
        NgxQRCodeModule,
        MatIconModule,
        MatButtonModule,
    ]
}) export class DevicesComponent implements OnInit {
    constructor(
        private readonly deviceService: DeviceService,
    ) { }
    async ngOnInit() {
        this.loadDevices();
    }
    conectarDispositivo() { }
    token = 'n2n34u5ifbn2uio34bhf2u34ybf2uy4b5fouy2b45f';
    async openFakeMobileService() {
        window.open(location.origin + '/Gerencial/Painel/mob-fake', 'teste' + Math.random().toString(32).substring(5).toUpperCase(), 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=350,height=600,left=-1000,top=-1000');
    }
    async loadDevices() {
        this.devices = await lastValueFrom(this.deviceService.getAll({ body: { query: '' } }));
    }
    devices?: Device[];
}