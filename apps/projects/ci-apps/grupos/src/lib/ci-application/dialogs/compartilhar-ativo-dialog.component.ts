import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NewsService } from '@ci/portal-api';

export interface CompartilharAtivoDialogData {
  grupoId: string;
  grupoName: string;
  tenantId: string;
}

@Component({
  selector: 'ci-compartilhar-ativo-dialog',
  standalone: false,
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <div class="header-title">
          <mat-icon color="primary">share</mat-icon>
          <div>
            <h3>Compartilhar Ativo no Grupo</h3>
            <span class="header-sub">Compartilhe Noticiários Diários, Formulários ou Cadastros via Tenant ID</span>
          </div>
        </div>
        <button mat-icon-button (click)="cancelar()" matTooltip="Fechar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-body">
        <!-- Banner Informativo sobre Tenant ID Scoping -->
        <div class="tenant-banner">
          <mat-icon>verified</mat-icon>
          <div>
            <strong>Escopo via Tenant ID: <code>{{ data.tenantId }}</code></strong>
            <p>O ativo compartilhado herda o identificador de Tenant da comunidade <strong>{{ data.grupoName }}</strong>, permitindo que todos os membros com acesso ao grupo visualizem e auditem o recurso compartilhado.</p>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="salvar()">
          <!-- Tipo de Ativo -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Tipo de Ativo *</mat-label>
            <mat-select formControlName="tipoAtivo" (selectionChange)="onTipoChange($event.value)">
              <mat-option value="NOTICIA">
                <mat-icon class="opt-icon">newspaper</mat-icon> Noticiário Diário
              </mat-option>
              <mat-option value="FORMULARIO">
                <mat-icon class="opt-icon">assignment</mat-icon> Formulário
              </mat-option>
              <mat-option value="CADASTRO">
                <mat-icon class="opt-icon">contacts</mat-icon> Cadastro
              </mat-option>
              <mat-option value="DOCUMENTO">
                <mat-icon class="opt-icon">description</mat-icon> Documento
              </mat-option>
              <mat-option value="OUTRO">
                <mat-icon class="opt-icon">widgets</mat-icon> Outro Ativo
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Se Notícia: Seleção de Notícia Recente ou Manual -->
          @if (form.get('tipoAtivo')?.value === 'NOTICIA' && noticiasRecentes.length > 0) {
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Selecionar Notícia Recente (Opcional)</mat-label>
              <mat-select (selectionChange)="onSelecionarNoticia($event.value)">
                <mat-option [value]="null">Digitar manualmente...</mat-option>
                @for (n of noticiasRecentes; track n.id) {
                  <mat-option [value]="n">
                    {{ n.title || 'Sem título' }} ({{ n.date | date:'dd/MM' }})
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          }

          <!-- Título do Ativo -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Título do Ativo *</mat-label>
            <input matInput formControlName="titulo" placeholder="Ex: Notícia sobre IA Generativa / Formulário de Onboarding" />
            <mat-error *ngIf="form.get('titulo')?.hasError('required')">Título é obrigatório</mat-error>
          </mat-form-field>

          <!-- Identificador do Ativo (ID da entidade) -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>ID do Ativo / Código de Referência *</mat-label>
            <input matInput formControlName="ativoId" placeholder="Ex: UUID da entidade, código ou slug" />
            <mat-hint>Identificador persistido na tabela de auditoria (FullAuditedEntity)</mat-hint>
            <mat-error *ngIf="form.get('ativoId')?.hasError('required')">ID do Ativo é obrigatório</mat-error>
          </mat-form-field>

          <!-- Descrição / Contexto do Compartilhamento -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Descrição / Observações para o Grupo</mat-label>
            <textarea matInput formControlName="descricao" rows="3" placeholder="Contexto sobre por que este item está sendo compartilhado com a comunidade..."></textarea>
          </mat-form-field>

          <!-- URL de Acesso Rápido -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Link / URL de Acesso (Opcional)</mat-label>
            <input matInput formControlName="url" placeholder="Ex: /News/123 ou https://..." />
            <mat-hint>Rota interna do portal ou link externo para acesso direto</mat-hint>
          </mat-form-field>

          <div class="dialog-actions">
            <button mat-button type="button" (click)="cancelar()">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || salvando">
              <mat-icon *ngIf="!salvando">share</mat-icon>
              <span>{{ salvando ? 'Compartilhando...' : 'Compartilhar Ativo' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 24px;
      min-width: 320px;
      max-width: 620px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--mat-sys-outline-variant, rgba(128,128,128,0.2));
    }
    .header-title {
      display: flex;
      gap: 12px;
      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
      h3 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
      }
      .header-sub {
        font-size: 0.85rem;
        color: var(--mat-sys-on-surface-variant, inherit);
        opacity: 0.8;
      }
    }
    .tenant-banner {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      background: var(--mat-sys-primary-container, rgba(25, 118, 210, 0.08));
      color: var(--mat-sys-on-primary-container, inherit);
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid var(--mat-sys-outline-variant, rgba(25, 118, 210, 0.2));

      mat-icon {
        color: var(--mat-sys-primary, #1976d2);
      }
      p {
        margin: 4px 0 0;
        font-size: 0.85rem;
        line-height: 1.4;
      }
      code {
        background: rgba(0,0,0,0.06);
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
      }
    }
    .full-width {
      width: 100%;
      margin-bottom: 4px;
    }
    .opt-icon {
      vertical-align: middle;
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 6px;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 12px;
    }
  `]
})
export class CompartilharAtivoDialogComponent implements OnInit {
  form: FormGroup;
  salvando = false;
  noticiasRecentes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CompartilharAtivoDialogComponent>,
    private newsService: NewsService,
    @Inject(MAT_DIALOG_DATA) public data: CompartilharAtivoDialogData
  ) {
    this.form = this.fb.group({
      tipoAtivo: ['NOTICIA', Validators.required],
      ativoId: ['', [Validators.required]],
      titulo: ['', [Validators.required]],
      descricao: [''],
      url: ['']
    });
  }

  ngOnInit() {
    this.carregarNoticias();
  }

  carregarNoticias() {
    this.newsService.getFeed({ offset: 0 }).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.noticiasRecentes = res;
        } else if (res?.content && Array.isArray(res.content)) {
          this.noticiasRecentes = res.content;
        }
      },
      error: () => {}
    });
  }

  onTipoChange(tipo: string) {
    if (tipo === 'FORMULARIO') {
      this.form.patchValue({
        url: this.form.get('ativoId')?.value ? `/Formularios/${this.form.get('ativoId')?.value}` : '/Formularios'
      });
    } else if (tipo === 'CADASTRO') {
      this.form.patchValue({
        url: this.form.get('ativoId')?.value ? `/Cadastros/${this.form.get('ativoId')?.value}` : '/Cadastros'
      });
    }
  }

  onSelecionarNoticia(noticia: any) {
    if (noticia) {
      this.form.patchValue({
        ativoId: String(noticia.id),
        titulo: noticia.title || 'Noticiário Diário',
        descricao: noticia.description || noticia.summary || '',
        url: noticia.url || `/News/${noticia.id}`
      });
    }
  }

  cancelar() {
    this.dialogRef.close();
  }

  salvar() {
    if (this.form.invalid || this.salvando) return;
    this.dialogRef.close(this.form.value);
  }
}
