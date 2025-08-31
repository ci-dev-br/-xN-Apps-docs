import { Component } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CoreModule } from "@ci/core";

@Component({
    imports: [
        CoreModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    selector: 'ci-sidebar-settings',
    standalone: true,
    styles: [
        `
            form{display: contents;}
            `
    ],
    template: `
            <mat-toolbar>
                <form [formGroup]="pesquisa">
                    <button mat-raised-button >Novo Grupo</button>
                    <mat-form-field>
                        <input matInput type="text" formControlName="search" placeholder="Procurar aplicativo">
                    </mat-form-field>
                </form>
            </mat-toolbar>
            <div style="display:flex; flex-direction:row; align-items: stretch; justify-content: stretch;">
                <div style="display:flex; flex-direction:column; align-items: stretch; justify-content: stretch;">
                    <button mat-raised-button >Categorias</button>
                </div>  
                <div>
                    <form>
                        <mat-form-field>
                            <input matInput />
                        </mat-form-field>
                    </form> 
                </div>  
            </div>
        `
})
export class SidebarSettings {
    pesquisa: FormGroup;
    constructor(fb: FormBuilder) {
        this.pesquisa = fb.group({
            search: []
        })
    }
}