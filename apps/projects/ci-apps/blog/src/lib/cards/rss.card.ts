import { HttpClient, HttpHeaderResponse, HttpHeaders } from "@angular/common/http";
import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { FormBuilder, FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { CoreModule } from "@ci/core";
import { XMLParser } from 'fast-xml-parser';
import { lastValueFrom } from "rxjs";

@Component({
    selector: 'ci-card--rss-card',
    template: `<mat-card>
        <h4 mat-card-title>Configure o serviço de RSS</h4>
        <p mat-card-subtitle>  Configure o cartão de RSS inserindo o endereço do RSS abaixo:</p>
        <mat-card-content>
        @if(stage==='config'){
            <div class="a row s">
                <mat-form-field>
                    <input matInput placeholder="URL" [(ngModel)]="url" (blur)="update()" />
                </mat-form-field>
                <button mat-raised-button (click)="configurar()" >Configurar</button>
            </div>
            }@else{
                 A
            }
        </mat-card-content>
    </mat-card> `,
    standalone: true,
    imports: [
        CoreModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
    ]
})
export class RSSCard implements OnChanges, OnInit {
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
    ngOnInit(): void {
        this.loadRSS();
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
        } catch (error) {
            console.trace(error);
        }
    }
    async configurar() {
        this.update();
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