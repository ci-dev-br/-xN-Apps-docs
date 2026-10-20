import { Component, Inject, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GroupService, GroupItem, GroupMemberRequestItem } from '@ci/portal-api';
import { UserAuthenticationService, formatUserPhotoUrl } from '@ci/auth';

export interface GruposModalData {
  initialTab?: number;
}

@Component({
  selector: 'ci-grupos-modal',
  templateUrl: './grupos-modal.component.html',
  styleUrls: ['./grupos-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ]
})
export class GruposModalComponent implements OnInit {
  selectedTab = 0;
  grupos: GroupItem[] = [];
  meusGrupos: GroupItem[] = [];
  loading = false;
  loadingMeus = false;
  creating = false;
  termoBusca = '';

  // Gerenciamento de solicitações por grupo
  solicitacoesPorGrupo: { [tenantId: string]: GroupMemberRequestItem[] } = {};
  loadingSolicitacoes: { [tenantId: string]: boolean } = {};
  grupoGerenciandoId: string | null = null;

  formCriar: FormGroup;

  isLoggedIn = false;

  constructor(
    private readonly groupService: GroupService,
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar,
    @Optional() private readonly userService?: UserAuthenticationService,
    @Optional() private readonly router?: Router,
    @Optional() public dialogRef?: MatDialogRef<GruposModalComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: GruposModalData,
  ) {
    this.selectedTab = data?.initialTab ?? 0;

    this.formCriar = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      descriptions: [''],
      coverUrl: [''],
      avatarUrl: [''],
      requiresApproval: [true],
    });

    this.isLoggedIn = !!this.userService?.user.value?.id;
  }

  ngOnInit(): void {
    this.carregarGrupos();
    this.userService?.user.subscribe(user => {
      const logged = !!user?.id;
      if (logged !== this.isLoggedIn || logged) {
        this.isLoggedIn = logged;
        if (this.isLoggedIn) {
          this.carregarMeusGrupos();
        }
      }
    });
  }

  onTabChange(index: number) {
    this.selectedTab = index;
    if (index === 0) {
      this.carregarGrupos();
    } else if (index === 2) {
      this.carregarMeusGrupos();
    }
  }

  abrirPaginaDoGrupo(grupo: GroupItem, event?: Event) {
    event?.stopPropagation();
    this.dialogRef?.close();
    this.router?.navigate(['/Grupos', grupo.id]);
  }

  carregarGrupos() {
    this.loading = true;
    this.groupService.listarGrupos(this.termoBusca).subscribe({
      next: (res) => {
        this.grupos = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao listar grupos:', err);
        this.loading = false;
      }
    });
  }

  carregarMeusGrupos() {
    this.loadingMeus = true;
    this.groupService.meusGrupos().subscribe({
      next: (res) => {
        this.meusGrupos = res;
        this.loadingMeus = false;
      },
      error: (err) => {
        console.error('Erro ao carregar meus grupos:', err);
        this.loadingMeus = false;
      }
    });
  }

  onBuscar() {
    this.carregarGrupos();
  }

  criarGrupo() {
    if (this.formCriar.invalid || this.creating) return;

    if (!this.isLoggedIn) {
      this.snackBar.open('Faça login para criar um grupo.', 'Ok', { duration: 3500 });
      return;
    }

    this.creating = true;
    const val = this.formCriar.value;

    this.groupService.criarGrupo({
      name: val.name,
      descriptions: val.descriptions,
      coverUrl: val.coverUrl,
      avatarUrl: val.avatarUrl,
      requiresApproval: val.requiresApproval,
    }).subscribe({
      next: (novo) => {
        this.creating = false;
        this.snackBar.open(`Grupo "${novo.name}" criado com sucesso! Você é o administrador.`, 'Ok', { duration: 4000 });
        this.formCriar.reset({ requiresApproval: true });
        this.selectedTab = 0;
        this.carregarGrupos();
        this.carregarMeusGrupos();
      },
      error: (err) => {
        console.error('Erro ao criar grupo:', err);
        this.creating = false;
        this.snackBar.open('Não foi possível criar o grupo. Verifique os dados.', 'Fechar', { duration: 3500 });
      }
    });
  }

  solicitarParticipacao(grupo: GroupItem, event?: Event) {
    event?.stopPropagation();
    if (!this.isLoggedIn) {
      this.snackBar.open('Faça login para participar deste grupo.', 'Ok', { duration: 3500 });
      return;
    }

    this.groupService.solicitarParticipacao(grupo.id).subscribe({
      next: (res) => {
        grupo.userStatus = res.status === 'APPROVED' ? 'MEMBER' : 'PENDING';
        if (res.status === 'APPROVED') {
          grupo.membersCount = (grupo.membersCount || 0) + 1;
        }
        this.snackBar.open(res.message, 'Ok', { duration: 4000 });
        this.carregarMeusGrupos();
      },
      error: (err) => {
        console.error('Erro ao solicitar participação:', err);
        this.snackBar.open('Não foi possível solicitar participação.', 'Fechar', { duration: 3000 });
      }
    });
  }

  sairDoGrupo(grupo: GroupItem, event?: Event) {
    event?.stopPropagation();
    const confirmed = confirm(`Deseja sair do grupo "${grupo.name}"?`);
    if (!confirmed) return;

    this.groupService.sairDoGrupo(grupo.id).subscribe({
      next: (res) => {
        grupo.userStatus = 'NONE';
        if (grupo.membersCount > 0) grupo.membersCount--;
        this.snackBar.open(res.message, 'Ok', { duration: 3000 });
        this.carregarMeusGrupos();
      },
      error: (err) => {
        console.error('Erro ao sair do grupo:', err);
        this.snackBar.open(err?.error?.message || 'Erro ao sair do grupo.', 'Fechar', { duration: 3000 });
      }
    });
  }

  alternarGerenciarSolicitacoes(grupo: GroupItem) {
    if (this.grupoGerenciandoId === grupo.id) {
      this.grupoGerenciandoId = null;
      return;
    }

    this.grupoGerenciandoId = grupo.id;
    this.loadingSolicitacoes[grupo.id] = true;

    this.groupService.listarSolicitacoes(grupo.id).subscribe({
      next: (reqs) => {
        this.solicitacoesPorGrupo[grupo.id] = reqs;
        this.loadingSolicitacoes[grupo.id] = false;
      },
      error: (err) => {
        console.error('Erro ao listar solicitações:', err);
        this.loadingSolicitacoes[grupo.id] = false;
      }
    });
  }

  responderSolicitacao(grupo: GroupItem, reqItem: GroupMemberRequestItem, aprovar: boolean) {
    this.groupService.responderSolicitacao(grupo.id, reqItem.id, aprovar).subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'Ok', { duration: 3000 });
        if (this.solicitacoesPorGrupo[grupo.id]) {
          this.solicitacoesPorGrupo[grupo.id] = this.solicitacoesPorGrupo[grupo.id].filter(r => r.id !== reqItem.id);
        }
        if (aprovar) {
          grupo.membersCount = (grupo.membersCount || 0) + 1;
        }
        if (grupo.pendingCount && grupo.pendingCount > 0) {
          grupo.pendingCount--;
        }
      },
      error: (err) => {
        console.error('Erro ao responder solicitação:', err);
        this.snackBar.open('Erro ao responder solicitação.', 'Fechar', { duration: 3000 });
      }
    });
  }

  getGroupInitials(name?: string): string {
    if (!name) return 'GP';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getAdminPhoto(user?: any): string | null {
    return formatUserPhotoUrl(user?.photo);
  }

  fechar() {
    this.dialogRef?.close();
  }
}
