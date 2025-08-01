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
    templateUrl: `pergunta-item.component.html`,
    styleUrl: `pergunta-item.component.scss`,
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