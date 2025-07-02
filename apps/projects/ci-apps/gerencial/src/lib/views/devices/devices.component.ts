import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { NgxQRCodeModule } from '@jonyadamit/ngx-qrcode-ivy';
import { CoreModule, WsService } from '@ci/core';
import { Device, DeviceService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";

export interface DeviceItem {
    device?: Device;
    status?: -1 | 0 | 1;
}

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
                padding: 12px;
                position: relative;
            }
            .devices{
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: 48px;
                padding: 48px;
                }
            .device > .status{
                width: 15px;
                height: 15px;
                border-radius: 9px;
                position: absolute;
                right: 14px;
                bottom: 14px;
            }
            .active{
                background-color: green;
            }
            .waiting{
                background-color: yellow;
            }
            .offline{
                border: solid 2px red;
                background-color: black;
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
           <div class="devices" > @for(item of devices; track item){
                <div class="device" >
                    {{item.device?.mac || ''}} / {{item.device?.type || ''}}          
                    <div class="status" [class.active]="item.status===1" [class.waiting]="item.status===0" [class.offline]="item.status===-1" >
                        </div>      
                    @if(item?.device?.phones) {@for(phone of item?.device?.phones; track phone){
                        <mat-icon>sim_card</mat-icon>
                    }}
                </div>
            } </div>
        }
    `,
    standalone: true,
    imports: [
        CoreModule,
        MatToolbarModule,
        NgxQRCodeModule,
        MatIconModule,
        MatButtonModule,
        MatIconModule,
    ]
}) export class DevicesComponent implements OnInit {
    constructor(
        private readonly deviceService: DeviceService,
        private readonly events: WsService,
    ) { }
    async ngOnInit() {
        this.loadDevices();
        this.events.addMessageListner('notice', (data: any) => {
            if (data.device_mac_assign) {
                let d = this.devices?.find(device => device.device?.mac === data.device_mac_assign);
                if (d) d.status = data.status;
            }
        })
    }
    conectarDispositivo() { }
    token = 'n2n34u5ifbn2uio34bhf2u34ybf2uy4b5fouy2b45f';
    async openFakeMobileService() {
        window.open(location.origin + '/Gerencial/Painel/mob-fake', 'teste' + Math.random().toString(32).substring(5).toUpperCase(), 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=350,height=600,left=-1000,top=-1000');
    }
    async loadDevices() {
        this.updateDevices(await lastValueFrom(this.deviceService.getAll({ body: { query: '' } })))
        this.events.Listening('Gerencial.Devices', {
            momentum: Date.now()
        })
    }
    updateDevices(devices: Device[]) {
        this.devices = devices.map(device => {
            return {
                status: -1,
                device,
            }
        });
    }
    devices?: DeviceItem[];
}