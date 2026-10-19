import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GroupService } from '@ci/portal-api';

@Component({
  selector: 'ci-novo-topico-dialog',
  standalone: false,
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-title">
          <mat-icon color="primary">forum</mat-icon>
          <h3>Iniciar Tópico de Discussão</h3>
        </div>
        <button mat-icon-button (click)="cancelar()" matTooltip="Fechar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-body">
        <form [formGroup]="form" (ngSubmit)="salvar()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Título do Tópico *</mat-label>
            <input matInput formControlName="title" placeholder="Ex: Proposta de melhoria na arquitetura de microsserviços" />
            <mat-error *ngIf="form.get('title')?.hasError('required')">O título é obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Conteúdo da Discussão *</mat-label>
            <textarea matInput formControlName="content" rows="5" placeholder="Compartilhe suas ideias, dúvidas ou contexto para que os membros do grupo possam colaborar..."></textarea>
            <mat-error *ngIf="form.get('content')?.hasError('required')">O conteúdo é obrigatório</mat-error>
          </mat-form-field>

          <div class="dialog-actions">
            <button mat-button type="button" (click)="cancelar()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || salvando">
              <mat-icon *ngIf="!salvando">send</mat-icon>
              <span>{{ salvando ? 'Publicando...' : 'Publicar Tópico' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 20px;
      min-width: 320px;
      max-width: 580px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--mat-sys-outline-variant, rgba(128,128,128,0.2));
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;
      h3 {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 600;
      }
    }
    .dialog-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .full-width {
      width: 100%;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }
  `]
})
export class NovoTopicoDialogComponent {
  form: FormGroup;
  salvando = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NovoTopicoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { grupoId: string }
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  salvar() {
    if (this.form.invalid || this.salvando) return;
    this.dialogRef.close(this.form.value);
  }
}
