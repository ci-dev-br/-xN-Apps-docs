import { Component, Inject } from "@angular/core";
import { Action } from "./Action";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
interface ActionsDialogData {
    acoes: { title: string, act?: any }[];
}
@Component({
    selector: 'ci-keyboartd-action-menu',
    template: `
 @if(stage==='menu'){
 @if(!!actions&& actions.length > 0){
 @for(item of actions || []; track $index){
 {{item.title}}
 <div class="linha" >
 <button mat-raised-button (click)="select(item)" >
 </button>
 </div>
 }
 }@else{
 <span>Nenhuma ação catalogada...</span>
 }
 <button mat-raised-button (click)="createNewAction()">Nova Ação</button>
 }@else if(stage === 'edit'){
 
 }`,
    styles: [`
 :host{
 padding:12px;
 }
 `],
    imports: [
        MatButtonModule,
        MatFormFieldModule,
        MatButtonModule,
    ],
    standalone: true,
})
export class ActionsMenuComponent {
    stage: 'menu' | 'edit' = 'menu';
    actions?: any[];
    customs?: any[];
    doEditing?: any;
    constructor(
        private readonly dialog: MatDialogRef<ActionsMenuComponent>,
        @Inject(MAT_DIALOG_DATA) data: ActionsDialogData
    ) {
        console.log(data)
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
}
