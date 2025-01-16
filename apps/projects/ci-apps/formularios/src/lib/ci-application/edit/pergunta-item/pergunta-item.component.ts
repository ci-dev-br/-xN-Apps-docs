import { Component, Input } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { CoreModule, DaoService } from "@ci/core";
import { Pergunta } from "@ci/portal-api";
import { Type, TYPES } from "../../../type";

@Component({
    standalone: true,
    imports: [
        CoreModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatSelectModule,
    ],
    selector: 'ci-pergunta',
    styles: `
        :host{display: contents;}
        mat-form-field{
            width: auto;
        }   
    `,
    template: `<ng-container [formGroup]="form" >
    <mat-form-field>
        <mat-label>Questão</mat-label>
        <input matInput placeholder="Qual a pergunta?" formControlName="questao" >

    </mat-form-field>
    <mat-form-field>
        <mat-select  formControlName="type">
            @for (item of types; track $index) {
                <mat-option [value]="item.name" >
               @if(item.icon) {<mat-icon>{{item.icon}}</mat-icon>}
               @if(item.description) { {{item.description}} }
                </mat-option>
            }
        </mat-select>
    </mat-form-field>
        @if(source?.options){
            @for (item of source?.options; track $index) {
                <button mat-icon-button>
                    <mat-icon>remove</mat-icon>
                </button>
            }
        }
        <mat-form-field>
            <input type="text" matInput placeholder="Adicionar opção">
            <mat-icon matPrefix>add</mat-icon>
            <span matSuffix>ou <a href="#">adicionar "Outro"</a></span>
        </mat-form-field>
</ng-container>`,
})
export class PerguntaItemComponent {
    types: Type[] = TYPES;
    form = this.formBuilder.group({
        questao: [, []],
        type: [, []],
        options: [, []],
    });
    private _source?: Pergunta | undefined;
    public get source(): Pergunta | undefined {
        return this._source;
    }
    @Input()
    public set source(value: Pergunta | undefined) {
        if (this._source === value) return;
        this._source = value;
        this.daos.bindDataForm(value, this.form);
    }
    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly daos: DaoService,
    ) { }
}