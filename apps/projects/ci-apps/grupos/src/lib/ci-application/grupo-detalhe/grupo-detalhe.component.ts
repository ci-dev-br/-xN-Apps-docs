import { Component, OnInit, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  GroupItem,
  GroupService,
  GroupTopicItem,
  GroupTopicMessageItem,
  GroupSharedAssetItem,
  GroupMemberRequestItem
} from '@ci/portal-api';
import { UserAuthenticationService } from '@ci/auth';
import { NovoTopicoDialogComponent } from '../dialogs/novo-topico-dialog.component';
import { CompartilharAtivoDialogComponent } from '../dialogs/compartilhar-ativo-dialog.component';

@Component({
  selector: 'ci-grupo-detalhe',
  templateUrl: './grupo-detalhe.component.html',
  styleUrls: ['./grupo-detalhe.component.scss'],
  standalone: false
})
export class GrupoDetalheComponent implements OnInit {
  grupoId!: string;
  grupo?: GroupItem;
  loadingGrupo = true;
  selectedTab = 0;

  // Tópicos
  topicos: GroupTopicItem[] = [];
  loadingTopicos = false;
  topicoExpandidoId?: string;
  mensagensPorTopico: { [topicoId: string]: GroupTopicMessageItem[] } = {};
  loadingMensagens: { [topicoId: string]: boolean } = {};
  respostaTexto: { [topicoId: string]: string } = {};
  enviandoResposta: { [topicoId: string]: boolean } = {};

  // Ativos Compartilhados
  ativos: GroupSharedAssetItem[] = [];
  loadingAtivos = false;
  filtroTipoAtivo = 'TODOS';

  // Solicitações / Moderação
  solicitacoes: GroupMemberRequestItem[] = [];
  loadingSolicitacoes = false;

  // Usuário Atual
  isLoggedIn = false;
  currentUserId?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Optional() private userService?: UserAuthenticationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.grupoId = params['id'];
      if (this.grupoId) {
        this.carregarDadosIniciais();
      }
    });

    this.userService?.user.subscribe((u: any) => {
      this.isLoggedIn = !!u?.id;
      this.currentUserId = u?.id;
    });
  }

  carregarDadosIniciais() {
    this.carregarGrupo();
    this.carregarTopicos();
    this.carregarAtivos();
  }

  carregarGrupo() {
    this.loadingGrupo = true;
    this.groupService.obterGrupo(this.grupoId).subscribe({
      next: (res) => {
        this.grupo = res;
        this.loadingGrupo = false;
        if (this.grupo.userStatus === 'ADMIN') {
          this.carregarSolicitacoes();
        }
      },
      error: (err) => {
        console.error('Erro ao obter dados do grupo:', err);
        this.snackBar.open('Não foi possível carregar as informações do grupo.', 'Ok', { duration: 3500 });
        this.loadingGrupo = false;
      }
    });
  }

  carregarTopicos() {
    this.loadingTopicos = true;
    this.groupService.listarTopicos(this.grupoId).subscribe({
      next: (res) => {
        this.topicos = res;
        this.loadingTopicos = false;
      },
      error: (err) => {
        console.error('Erro ao listar tópicos:', err);
        this.loadingTopicos = false;
      }
    });
  }

  carregarAtivos() {
    this.loadingAtivos = true;
    this.groupService.listarAtivosCompartilhados(this.grupoId).subscribe({
      next: (res) => {
        this.ativos = res;
        this.loadingAtivos = false;
      },
      error: (err) => {
        console.error('Erro ao listar ativos compartilhados:', err);
        this.loadingAtivos = false;
      }
    });
  }

  carregarSolicitacoes() {
    if (!this.grupo) return;
    this.loadingSolicitacoes = true;
    this.groupService.listarSolicitacoes(this.grupo.id).subscribe({
      next: (res) => {
        this.solicitacoes = res;
        this.loadingSolicitacoes = false;
      },
      error: (err) => {
        console.error('Erro ao listar solicitações pendentes:', err);
        this.loadingSolicitacoes = false;
      }
    });
  }

  // --- TÓPICOS & MENSAGENS ---
  abrirDialogNovoTopico() {
    if (!this.isLoggedIn) {
      this.snackBar.open('Faça login para criar um tópico.', 'Ok', { duration: 3500 });
      return;
    }

    const dialogRef = this.dialog.open(NovoTopicoDialogComponent, {
      width: '560px',
      data: { grupoId: this.grupoId }
    });

    dialogRef.afterClosed().subscribe((dados) => {
      if (dados) {
        this.groupService.criarTopico(this.grupoId, dados).subscribe({
          next: (novo) => {
            this.topicos.unshift(novo);
            this.snackBar.open('Tópico criado com sucesso!', 'Ok', { duration: 3000 });
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Erro ao criar tópico', 'Fechar', { duration: 3500 });
          }
        });
      }
    });
  }

  alternarTopico(topico: GroupTopicItem) {
    if (this.topicoExpandidoId === topico.id) {
      this.topicoExpandidoId = undefined;
    } else {
      this.topicoExpandidoId = topico.id;
      if (!this.mensagensPorTopico[topico.id]) {
        this.carregarMensagensDoTopico(topico.id);
      }
    }
  }

  carregarMensagensDoTopico(topicoId: string) {
    this.loadingMensagens[topicoId] = true;
    this.groupService.listarMensagensTopico(topicoId).subscribe({
      next: (res) => {
        this.mensagensPorTopico[topicoId] = res;
        this.loadingMensagens[topicoId] = false;
      },
      error: (err) => {
        console.error('Erro ao carregar mensagens:', err);
        this.loadingMensagens[topicoId] = false;
      }
    });
  }

  enviarResposta(topico: GroupTopicItem) {
    const texto = this.respostaTexto[topico.id]?.trim();
    if (!texto || this.enviandoResposta[topico.id]) return;

    if (!this.isLoggedIn) {
      this.snackBar.open('Faça login para responder neste tópico.', 'Ok', { duration: 3500 });
      return;
    }

    this.enviandoResposta[topico.id] = true;
    this.groupService.responderTopico(topico.id, texto).subscribe({
      next: (msg) => {
        if (!this.mensagensPorTopico[topico.id]) {
          this.mensagensPorTopico[topico.id] = [];
        }
        this.mensagensPorTopico[topico.id].push(msg);
        this.respostaTexto[topico.id] = '';
        topico.repliesCount = (topico.repliesCount || 0) + 1;
        this.enviandoResposta[topico.id] = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Erro ao enviar resposta', 'Fechar', { duration: 3500 });
        this.enviandoResposta[topico.id] = false;
      }
    });
  }

  // --- ATIVOS COMPARTILHADOS (VIA TENANT ID) ---
  abrirDialogCompartilharAtivo() {
    if (!this.isLoggedIn) {
      this.snackBar.open('Faça login para compartilhar ativos.', 'Ok', { duration: 3500 });
      return;
    }

    if (!this.grupo) return;

    const dialogRef = this.dialog.open(CompartilharAtivoDialogComponent, {
      width: '620px',
      data: {
        grupoId: this.grupo.id,
        grupoName: this.grupo.name,
        tenantId: this.grupo.tenantId || this.grupo.id
      }
    });

    dialogRef.afterClosed().subscribe((dados) => {
      if (dados) {
        this.groupService.compartilharAtivo(this.grupoId, dados).subscribe({
          next: (novo) => {
            this.ativos.unshift(novo);
            this.snackBar.open('Ativo compartilhado com sucesso no Tenant do grupo!', 'Ok', { duration: 4000 });
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Erro ao compartilhar ativo', 'Fechar', { duration: 3500 });
          }
        });
      }
    });
  }

  get ativosFiltrados(): GroupSharedAssetItem[] {
    if (this.filtroTipoAtivo === 'TODOS') return this.ativos;
    return this.ativos.filter((a) => a.tipoAtivo === this.filtroTipoAtivo);
  }

  abrirLinkAtivo(ativo: GroupSharedAssetItem) {
    if (ativo.url) {
      if (ativo.url.startsWith('http')) {
        window.open(ativo.url, '_blank');
      } else {
        this.router.navigateByUrl(ativo.url);
      }
    } else {
      switch (ativo.tipoAtivo) {
        case 'NOTICIA':
          this.router.navigate(['/News', ativo.ativoId]);
          break;
        case 'FORMULARIO':
          this.router.navigate(['/Formularios', ativo.ativoId]);
          break;
        case 'CADASTRO':
          this.router.navigate(['/Cadastros', ativo.ativoId]);
          break;
        case 'DOCUMENTO':
          this.router.navigate(['/Documentos', ativo.ativoId]);
          break;
        default:
          this.snackBar.open(`Ativo ID: ${ativo.ativoId}`, 'Ok', { duration: 3000 });
      }
    }
  }

  // --- MODERAÇÃO & AÇÕES DE GRUPO ---
  responderSolicitacao(reqItem: GroupMemberRequestItem, aprovar: boolean) {
    if (!this.grupo) return;

    this.groupService.responderSolicitacao(this.grupo.id, reqItem.id, aprovar).subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'Ok', { duration: 3500 });
        this.solicitacoes = this.solicitacoes.filter((s) => s.id !== reqItem.id);
        if (this.grupo) {
          this.grupo.pendingCount = Math.max(0, (this.grupo.pendingCount || 1) - 1);
          if (aprovar) {
            this.grupo.membersCount = (this.grupo.membersCount || 0) + 1;
          }
        }
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Erro ao processar solicitação', 'Fechar', { duration: 3500 });
      }
    });
  }

  sairDoGrupo() {
    if (!this.grupo) return;
    this.groupService.sairDoGrupo(this.grupo.id).subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'Ok', { duration: 3500 });
        this.router.navigate(['/Grupos']);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Erro ao sair do grupo', 'Fechar', { duration: 3500 });
      }
    });
  }

  copiarTenantId() {
    if (this.grupo?.tenantId) {
      navigator.clipboard.writeText(this.grupo.tenantId);
      this.snackBar.open('Tenant ID copiado para a área de transferência!', 'Ok', { duration: 2500 });
    }
  }

  voltar() {
    this.router.navigate(['/Grupos']);
  }

  getGroupInitials(name?: string): string {
    if (!name) return 'GP';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}
