import { HttpClient, HttpHeaderResponse, HttpHeaders } from "@angular/common/http";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { FormBuilder, FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { CoreModule } from "@ci/core";
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';
import { lastValueFrom } from "rxjs";

@Component({
    selector: 'ci-card--rss-card',
    template: `
        @if(stage==='config'){
            <h4>Configure o serviço de RSS</h4>
            <p>Configure o cartão de RSS inserindo o endereço do RSS abaixo:</p>
            <mat-form-field>
                <input matInput placeholder="URL" [(ngModel)]="url" (blur)="update()" />
        </mat-form-field>}
        @else{
            @if(!!data?.title){
                <h1>{{data?.title}}</h1>
            }
        }
    `,
    standalone: true,
    imports: [
        CoreModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
    ]
})
export class RSSCard implements OnChanges {
    stage: 'config' | 'run' = 'config';
    data?: any;
    @Input() url?: string;
    protected async update() {
        if (this.url && this.url?.trim().length > 0) {
            await this.loadRSS();
            this.stage = 'run';
        }
    }
    constructor(
        private readonly fb: FormBuilder,
        private readonly http: HttpClient,
    ) { }
    ngOnChanges(changes: SimpleChanges): void {

    }
    async loadRSS() {
        try {
            if (!this.url) return;
            const xml_parser = new XMLParser();
            let json_rss_loaded = xml_parser.parse(
                await lastValueFrom(this.http.get(this.url, {
                    responseType: 'text'
                })));

            this.data = json_rss_loaded;
            // const builder = new XMLBuilder();
            // const xmlContent = builder.build(json_rss_loaded);
        } catch (error) {
            console.trace(error);
        }
    }
}
export const RSSCardInfo = {
    title: 'RSS',
    descricao: `RSS Card, visualização de conteúdo em feed RSS a partir de xml.`,
    tags: ['Blogs'],
    componentRef: RSSCard,
    componentVersion: '1.0.0',
    componentName: 'RSSCard',
    settings: {
        url: { label: 'Url' }
    }
};