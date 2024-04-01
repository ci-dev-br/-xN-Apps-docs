import { Component, NgModule, OnDestroy } from "@angular/core";
import { ApiModule, SystemService } from "@portal/api";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { lastValueFrom } from "rxjs";

@Component({
    selector: 'px-cpu-widget',
    template: `
    <div #contentRef class="content">
        <ngx-charts-line-chart [view]="[contentRef.getBoundingClientRect().width,contentRef.getBoundingClientRect().height]" [results]="cpuStatus"></ngx-charts-line-chart>
    </div>
    `,
    styles: [`
    :host{
        display: contents;
    }
    .content{
        position: absolute; left: 0; right: 0; top:0 ; bottom: 0;
    }
    `]
})
export class CPUWidget implements OnDestroy {
    alive? = true;
    cpuStatus?: any[];
    constructor(
        private readonly service: SystemService,
    ) {
        this.load();
    }
    ngOnDestroy() {
        this.alive = undefined;
    }
    async load() {
        this.updateCpuInfo();
    }
    private async updateCpuInfo() {
        try {
            const cpu_infos = (await lastValueFrom(this.service.systemLeitura()));
            const x: any = {};
            x['user'] = { name: 'User', series: [] };
            x['system'] = { name: 'System', series: [] };
            x['heapTotal'] = { name: 'heapTotal', series: [] };
            x['heapUsed'] = { name: 'heapUsed', series: [] };
            x['rss'] = { name: 'rss', series: [] };
            x['external'] = { name: 'external', series: [] };
            cpu_infos.forEach(i => {
                x['user'].series.push({
                    "value": i.user,
                    "name": i.moment,
                },);
                x['system'].series.push({
                    "value": i.system,
                    "name": i.moment,
                },);
                x['heapTotal'].series.push({
                    "value": i.heapTotal,
                    "name": i.moment,
                },);
                x['heapUsed'].series.push({
                    "value": i.heapUsed,
                    "name": i.moment,
                },);
                x['rss'].series.push({
                    "value": i.rss,
                    "name": i.moment,
                },);
                x['external'].series.push({
                    "value": i.external,
                    "name": i.moment,
                },);
            });
            this.cpuStatus = [...Object.values(x)];
        } catch (error) {

            console.error(error);
        }
        if (this.alive) setTimeout(() => this.updateCpuInfo(), 1000);
    }
}
@NgModule({
    declarations: [
        CPUWidget,
    ],
    imports: [
        ApiModule,
        NgxChartsModule,
    ],
    exports: [
        CPUWidget,
    ]
})
export class CPUWidgetModule { }
export const CPUWidgetInfo = {
    title: "CPU",
    description: 'Visualizar CPU do Servidor',
    tags: [],
    settings: {
        /*  value: { type: 'text', label: "Valor total" } */
    },
    module: CPUWidgetModule, component: CPUWidget
};