import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { NgxQRCodeModule } from '@jonyadamit/ngx-qrcode-ivy';
import { CoreModule, WsService } from '@ci/core';
import { Device, DeviceService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

export interface DeviceItem {
    device?: Device;
    status?: -1 | 0 | 1;
}

@Component({
    selector: 'ci-devices',
    templateUrl: 'devices.component.html',
    styleUrl: 'devices.component.scss',
    standalone: true,
    imports: [
        CoreModule,
        MatToolbarModule,
        NgxQRCodeModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
    ]
}) export class DevicesComponent implements OnInit {
    constructor(
        private readonly deviceService: DeviceService,
        private readonly events: WsService,
    ) { }
    async ngOnInit() {
        this.LoadDevices();
        this.events.addMessageListener('notice', (data: any) => {
            if (data.device_mac_assign) {
                let device_found = this.devices?.find(device => device.device?.mac === data.device_mac_assign);
                if (device_found && data.status !== undefined) device_found.status = data.status;
            }
        })
        this.events.eventListener('Devices', (data: { data: { devices: Device[] } }) => {
            if (!!data?.data?.devices) {
                this.devices?.forEach(deviceItem => {
                    let exists = data.data.devices.find(d => d.mac === deviceItem.device?.mac);
                    deviceItem.status = exists ? 1 : -1;
                });
            }
        })
        this.events.subject?.subscribe(async () => {
            setTimeout(() => {
                this.statusConnection = this.events?.status || 'loading';
            }, 0);
        });
    }
    statusConnection = 'loading';
    conectarDispositivo() { }
    token = '';
    async openFakeMobileService() {
        window.open(location.origin + '/Gerencial/Painel/mob-fake', 'teste' + Math.random().toString(32).substring(5).toUpperCase(), 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=350,height=600,left=-1000,top=-1000');
    }
    async LoadDevices() {
        this.UpdateDevices(await lastValueFrom(this.deviceService.getAll({ body: { query: '' } })))
        this.events.AddEventListener('Gerencial.Devices', {
            momento: Date.now()
        })
    }
    UpdateDevices(devices: Device[]) {
        this.devices = devices.map(device => {
            return {
                status: -1,
                device,
            }
        });
    }
    async TestSendSMS() {
        this.events.Emit({
            event: 'events',
            data: {
                type: 'SMS.Send',
                to: '41998914179',
                content: 'Mensagem de teste. Teste concluído. ' + new Date().toISOString()
            }
        })
    }
    devices?: DeviceItem[];
}