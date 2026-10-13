import { Component, Inject } from "@angular/core";
import { Action } from "./Action";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatTooltipModule } from "@angular/material/tooltip";
interface ActionsDialogData {
    acoes: { title: string, act?: any }[];
}
@Component({
    selector: 'ci-keyboartd-action-menu',
    template: `
 @if(stage==='menu'){
 @if(!!actions&& actions.length > 0){
 @for(item of actions || []; track $index){
 <div class="linha" >
    <button mat-raised-button (click)="select(item)" >
            @if(item.icon){<mat-icon>{{item.icon}}</mat-icon>}{{item.title}} 
    </button>
    <button mat-button (click)="edit(item)" ><mat-icon>edit</mat-icon></button>
 </div>
 }
 }@else{
 <span>Nenhuma ação catalogada...</span>
 }
 <button mat-raised-button (click)="createNewAction()">Nova Ação</button>
 }@else if(stage === 'edit' && !!doEditing){
    <form [formGroup]="editForm">
        <h1>{{doEditing.title}}</h1>
        <mat-form-field>
            <mat-label>
                Title
            </mat-label>
            <input type="text" matInput formControlName="title" >
        </mat-form-field>
        <mat-form-field>
            <mat-label>
                Ícone
            </mat-label>
            <input type="text" matInput formControlName="icon" >
        </mat-form-field>
        @if(!!doEditing?.act){
            @for(item of doEditing!.act!; track $index){
            <mat-form-field>
                <mat-label>
                    Ação
                </mat-label>
                <input type="text" matInput [value]="item" (change)="doEditing.act[$index] = $event.target!.value!" />
                <button matSuffix mat-icon-button [matTooltip]="'Remover esta ação'" (click)="doEditing!.act!.splice($index,1)" ><mat-icon>remove</mat-icon></button>
                <button matSuffix mat-icon-button [matTooltip]="'Adiciona ação antes'"  (click)="doEditing!.act!.splice($index,0,'')" ><mat-icon>add</mat-icon></button>
            </mat-form-field>       
            }
        }
        <button mat-button (click)="doEditing!.act = [...(doEditing.act||[]),'']" ><mat-icon>add</mat-icon></button>
        <button mat-button (click)="confirmar()">Confirmar</button>
    </form>
 }`,
    styles: [`
 :host{
 padding:12px;
 } form {display: flex; flex-direction: column;}
 `],
    imports: [
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
    standalone: true,
})
export class ActionsMenuComponent {
    stage: 'menu' | 'edit' = 'menu';
    actions?: any[];
    customs?: any[];
    doEditing?: any;
    editForm: FormGroup;
    constructor(
        private readonly dialog: MatDialogRef<ActionsMenuComponent>,
        @Inject(MAT_DIALOG_DATA) data: ActionsDialogData
        , formBuilder: FormBuilder,
    ) {
        this.editForm = formBuilder.group({
            title: [], icon: [], act: []
        })
        if (data?.acoes) this.actions = data.acoes;
    }
    async select(item: any) {
        this.dialog.close(item)
    }
    async createNewAction() {
        this.actions = [...(this.customs = [{ title: 'Nova ação' }]), ...(this.actions || [])];
        localStorage.setItem('@User(Keyboard)::custom_actions', JSON
            .stringify(this.customs)
        );
    }
    async edit(item: any) {
        this.stage = 'edit';
        this.doEditing = item;
        this.editForm.reset(item);
    }
    async confirmar() {
        if (this.editForm.invalid) {
            this.editForm.markAllAsTouched();
            return;
        }
        Object.assign(this.doEditing, this.editForm.getRawValue());
        this.stage = 'menu';
        this.doEditing = undefined;
    }
}
