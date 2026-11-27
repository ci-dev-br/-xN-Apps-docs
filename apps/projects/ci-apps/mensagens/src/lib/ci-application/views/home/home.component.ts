import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDrawer } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription, interval } from 'rxjs';
import {
  ConversationItem,
  DecryptedMessage,
  EncryptedMessagerService,
  AvailableUserItem,
} from '@ci/portal-api';
import { NavbarContextAction, NavbarService } from '@ci/components';
import { NovaConversaDialogComponent } from '../../dialogs/nova-conversa-dialog.component';

const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB por anexo

@Component({
  selector: 'ci-mensagens-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer?: MatDrawer;
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef;
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  isSmallScreen = false;
  antiPrintAtivo = false;
  visibleMessageIds = new Set<string>();
  private messageObserver?: IntersectionObserver;

  conversas: ConversationItem[] = [];
  conversasFiltradas: ConversationItem[] = [];
  termoBusca = '';
  conversaAtiva?: ConversationItem;

  mensagens: DecryptedMessage[] = [];
  loadingConversas = false;
  loadingMensagens = false;
  enviando = false;

  textoMensagem = '';
  anexosPendentes: Array<{
    name: string;
    size?: number;
    type?: string;
    data?: string;
  }> = [];

  private pollingSub?: Subscription;
  private responsiveSub?: Subscription;
  private routeQuerySub?: Subscription;
  private shieldTimeout?: any;
  private pendingConversationId?: string;
  private messagesEpoch = 0;

  constructor(
    private messagerService: EncryptedMessagerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver,
    private cdr: ChangeDetectorRef,
    @Optional() private navbarService?: NavbarService,
    @Optional() private route?: ActivatedRoute,
  ) {}

  @HostListener('window:keyup', ['$event'])
  onWindowKeyUp(event: KeyboardEvent) {
    // Tecla PrintScreen (código 44 ou chave 'PrintScreen')
    if (event.key === 'PrintScreen' || event.keyCode === 44) {
      this.ativarProtecaoAntiPrint(true);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onWindowKeyDown(event: KeyboardEvent) {
    // Atalhos de captura de tela como Ctrl+P (impressão) ou atalhos com Meta/Win
    if ((event.ctrlKey || event.metaKey) && (event.key === 'p' || event.key === 'P')) {
      event.preventDefault();
      this.ativarProtecaoAntiPrint(true);
    }
  }

  @HostListener('window:blur')
  onWindowBlur() {
    // Quando ferramentas de print como Snipping Tool (Win+Shift+S) desfocam a janela
    this.ativarProtecaoAntiPrint(false);
  }

  ativarProtecaoAntiPrint(comAviso = true) {
    this.antiPrintAtivo = true;

    // Esvazia ou substitui a área de transferência caso o OS tenha capturado a tela
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        navigator.clipboard.writeText('🔒 Conteúdo protegido contra captura de tela.').catch(() => {});
      } catch {}
    }

    if (comAviso) {
      this.snackBar.open('Captura de tela bloqueada: o conteúdo está protegido contra print.', 'Ok', {
        duration: 2500,
      });
    }

    if (this.shieldTimeout) {
      clearTimeout(this.shieldTimeout);
    }
    this.shieldTimeout = setTimeout(() => {
      this.antiPrintAtivo = false;
      this.cdr.markForCheck();
    }, 1200);
  }

  ngOnInit() {
    this.registrarAcoesNavbar();

    if (this.route?.queryParamMap) {
      this.routeQuerySub = this.route.queryParamMap.subscribe((params) => {
        const targetConvId = params.get('conversationId')?.trim();
        if (targetConvId) {
          this.pendingConversationId = targetConvId;
          this.selecionarConversaPorIdSeDisponivel(targetConvId);
        }
      });
    }

    this.carregarConversas();

    // Observa mudanças de tela para alternar o modo do drawer
    this.responsiveSub = this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe((state) => {
        this.isSmallScreen = state.matches;
        this.cdr.markForCheck();
      });

    // Inicia verificação periódica de novas mensagens
    this.pollingSub = interval(5000).subscribe(() => {
      this.atualizarConversasSilencioso();
      if (this.conversaAtiva && !this.enviando) {
        this.carregarMensagensSilencioso(this.conversaAtiva.id);
      }
    });
  }

  ngOnDestroy() {
    this.navbarService?.clearContextActions();
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
    if (this.responsiveSub) {
      this.responsiveSub.unsubscribe();
    }
    if (this.routeQuerySub) {
      this.routeQuerySub.unsubscribe();
    }
    if (this.shieldTimeout) {
      clearTimeout(this.shieldTimeout);
    }
    if (this.messageObserver) {
      this.messageObserver.disconnect();
    }
  }

  private registrarAcoesNavbar() {
    if (!this.navbarService) return;
    const actions: NavbarContextAction[] = [
      {
        id: 'mensagens-nova-conversa',
        label: 'Nova Conversa',
        icon: 'chat',
        variant: 'flat',
        color: 'primary',
        tooltip: 'Iniciar nova conversa criptografada',
        onClick: () => this.abrirNovaConversaDialog(),
      },
      {
        id: 'mensagens-atualizar',
        label: 'Atualizar',
        icon: 'refresh',
        variant: 'stroked',
        tooltip: 'Atualizar conversas e mensagens',
        onClick: () => {
          this.carregarConversas();
          if (this.conversaAtiva) {
            this.carregarMensagens(this.conversaAtiva.id);
          }
        },
      },
    ];
    this.navbarService.setContextActions(actions, 'Mensagens');
  }

  private selecionarConversaPorIdSeDisponivel(conversationId?: string) {
    if (!conversationId || this.conversas.length === 0) return;
    const found = this.conversas.find(
      (c) => c.id === conversationId || c.channelHash === conversationId
    );
    if (found && this.conversaAtiva?.id !== found.id) {
      this.pendingConversationId = undefined;
      this.selecionarConversa(found);
    }
  }

  carregarConversas() {
    this.loadingConversas = true;
    this.messagerService.listarConversas().subscribe({
      next: (res) => {
        this.conversas = res || [];
        this.aplicarFiltroConversas();
        this.loadingConversas = false;
        if (this.pendingConversationId) {
          this.selecionarConversaPorIdSeDisponivel(this.pendingConversationId);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loadingConversas = false;
        this.snackBar.open(this.extrairMensagemErro(err, 'Erro ao carregar conversas'), 'Ok', { duration: 3500 });
        this.cdr.markForCheck();
      }
    });
  }

  atualizarConversasSilencioso() {
    this.messagerService.listarConversas().subscribe({
      next: (res) => {
        const novasConversas = res || [];
        const mudou = novasConversas.length !== this.conversas.length ||
          novasConversas.some((c, i) =>
            c.id !== this.conversas[i]?.id ||
            c.lastMessageAt !== this.conversas[i]?.lastMessageAt ||
            c.unreadCount !== this.conversas[i]?.unreadCount
          );
        if (mudou) {
          this.conversas = novasConversas;
          if (this.conversaAtiva) {
            const updatedActive = this.conversas.find((c) => c.id === this.conversaAtiva?.id);
            if (updatedActive) {
              updatedActive.unreadCount = 0;
              this.conversaAtiva = updatedActive;
            }
          }
          this.aplicarFiltroConversas();
          this.cdr.markForCheck();
        }
      }
    });
  }

  aplicarFiltroConversas() {
    if (!this.termoBusca || !this.termoBusca.trim()) {
      this.conversasFiltradas = this.conversas;
    } else {
      const termo = this.termoBusca.toLowerCase().trim();
      this.conversasFiltradas = this.conversas.filter(
        c => (c.contactName && c.contactName.toLowerCase().includes(termo)) ||
             (c.lastMessage && c.lastMessage.toLowerCase().includes(termo))
      );
    }
  }

  selecionarConversa(conversa: ConversationItem) {
    this.messagesEpoch++;
    this.conversaAtiva = conversa;
    conversa.unreadCount = 0;
    this.mensagens = [];
    this.carregarMensagens(conversa.id);
    if (this.isSmallScreen && this.drawer) {
      this.drawer.close();
    }
  }

  voltarParaLista() {
    if (this.drawer) {
      this.drawer.open();
    }
  }

  /**
   * Determina se o balão de mensagem deve ser renderizado no HTML (viewport virtual)
   */
  isMessageVisible(id: string, index: number): boolean {
    if (this.visibleMessageIds.has(id)) {
      return true;
    }
    const total = this.mensagens.length;
    // Mantém sempre ativas as últimas 15 mensagens (visíveis na base do chat no carregamento inicial)
    if (index >= total - 15) {
      return true;
    }
    if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
      return true;
    }
    return false;
  }

  configurarIntersectionObserver() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    if (this.messageObserver) {
      this.messageObserver.disconnect();
    }

    this.messageObserver = new IntersectionObserver(
      (entries) => {
        let mudou = false;
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-id');
          if (id) {
            if (entry.isIntersecting) {
              if (!this.visibleMessageIds.has(id)) {
                this.visibleMessageIds.add(id);
                mudou = true;
              }
            } else {
              if (this.visibleMessageIds.has(id)) {
                this.visibleMessageIds.delete(id);
                mudou = true;
              }
            }
          }
        });
        if (mudou) {
          this.cdr.markForCheck();
        }
      },
      {
        root: this.messagesContainer?.nativeElement || null,
        rootMargin: '180px 0px 180px 0px',
        threshold: 0.01,
      }
    );

    setTimeout(() => {
      this.observarElementosMensagens();
    }, 60);
  }

  observarElementosMensagens() {
    if (!this.messageObserver || !this.messagesContainer) return;
    const elements = this.messagesContainer.nativeElement.querySelectorAll('.message-row');
    elements.forEach((el: Element) => {
      this.messageObserver?.observe(el);
    });
  }

  carregarMensagens(conversationId: string) {
    const requestEpoch = ++this.messagesEpoch;
    this.loadingMensagens = true;
    this.visibleMessageIds.clear();
    this.messagerService.listarMensagens(conversationId).subscribe({
      next: (res) => {
        if (requestEpoch !== this.messagesEpoch || this.conversaAtiva?.id !== conversationId) {
          return;
        }
        this.mensagens = res || [];
        this.loadingMensagens = false;
        this.scrollToBottom();
        this.configurarIntersectionObserver();
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (requestEpoch !== this.messagesEpoch) return;
        this.loadingMensagens = false;
        this.snackBar.open(this.extrairMensagemErro(err, 'Erro ao carregar mensagens'), 'Ok', { duration: 3500 });
        this.cdr.markForCheck();
      }
    });
  }

  carregarMensagensSilencioso(conversationId: string) {
    if (this.enviando) return;
    const requestEpoch = this.messagesEpoch;
    this.messagerService.listarMensagens(conversationId).subscribe({
      next: (res) => {
        // Ignora resposta de polling se houve envio ou troca de conversa enquanto a requisição estava em voo
        if (this.enviando || requestEpoch !== this.messagesEpoch || this.conversaAtiva?.id !== conversationId) {
          return;
        }
        const novasMensagens = res || [];
        const countAnterior = this.mensagens.length;
        const ultimaAnterior = countAnterior > 0 ? this.mensagens[countAnterior - 1]?.id : null;
        const ultimaNova = novasMensagens.length > 0 ? novasMensagens[novasMensagens.length - 1]?.id : null;

        // Só atualiza o array de mensagens se o número de mensagens ou o último item mudou
        if (novasMensagens.length !== countAnterior || ultimaNova !== ultimaAnterior) {
          this.mensagens = novasMensagens;
          if (novasMensagens.length > countAnterior) {
            this.scrollToBottom();
          }
          setTimeout(() => this.observarElementosMensagens(), 80);
          this.cdr.markForCheck();
        }
      }
    });
  }

  abrirNovaConversaDialog() {
    const dialogRef = this.dialog.open(NovaConversaDialogComponent, {
      width: '480px',
    });

    dialogRef.afterClosed().subscribe((targetUser: AvailableUserItem) => {
      if (targetUser) {
        this.iniciarConversaComUsuario(targetUser.id);
      }
    });
  }

  iniciarConversaComUsuario(targetUserId: string) {
    this.loadingMensagens = true;
    this.messagerService.obterOuCriarConversa(targetUserId).subscribe({
      next: (conv) => {
        this.carregarConversas();
        this.selecionarConversa(conv);
      },
      error: (err) => {
        this.snackBar.open(this.extrairMensagemErro(err, 'Erro ao iniciar conversa'), 'Ok', { duration: 3500 });
        this.loadingMensagens = false;
        this.cdr.markForCheck();
      }
    });
  }

  // --- ANEXOS ---
  abrirSeletorArquivos() {
    this.fileInput?.nativeElement.click();
  }

  onArquivosSelecionados(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
        this.snackBar.open(`O arquivo "${file.name}" excede o limite de 10 MB.`, 'Ok', { duration: 3500 });
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.anexosPendentes.push({
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result as string,
        });
        this.cdr.markForCheck();
      };
      reader.onerror = () => {
        this.snackBar.open(`Não foi possível ler o arquivo "${file.name}".`, 'Ok', { duration: 3500 });
      };
      reader.readAsDataURL(file);
    }

    input.value = '';
  }

  removerAnexoPendente(index: number) {
    this.anexosPendentes.splice(index, 1);
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // --- ENVIO ---
  onEnterPressionado(event: Event) {
    const keyboardEvent = event as KeyboardEvent;

    // No celular, não envia ao teclar Enter (permite quebras de linha e previne envio acidental pelo teclado virtual)
    if (this.isSmallScreen) {
      return;
    }

    // No desktop, envia somente se a tecla for explicitamente Enter sem Shift e fora de composição IME
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey && !keyboardEvent.isComposing) {
      keyboardEvent.preventDefault();
      this.enviarMensagem();
    }
  }

  enviarMensagem() {
    const texto = this.textoMensagem.trim();
    if ((!texto && this.anexosPendentes.length === 0) || !this.conversaAtiva || this.enviando) {
      return;
    }

    this.enviando = true;
    this.messagesEpoch++;
    const conversationId = this.conversaAtiva.id;
    const anexosParaEnviar = [...this.anexosPendentes];

    this.messagerService.enviarMensagem(conversationId, texto, anexosParaEnviar).subscribe({
      next: (novaMsg) => {
        this.messagesEpoch++;
        if (!this.mensagens.some((m) => m.id === novaMsg.id)) {
          this.mensagens.push(novaMsg);
        }
        this.visibleMessageIds.add(novaMsg.id);
        this.textoMensagem = '';
        this.anexosPendentes = [];
        this.enviando = false;

        const nowIso = novaMsg.createdAt || new Date().toISOString();
        const previewText = texto || (anexosParaEnviar.length === 1 ? `[Anexo: ${anexosParaEnviar[0].name}]` : `[${anexosParaEnviar.length} Anexos]`);
        if (this.conversaAtiva) {
          this.conversaAtiva.lastMessage = previewText;
          this.conversaAtiva.lastMessageAt = nowIso;
          this.atualizarResumoConversaNaLista(this.conversaAtiva.id, previewText, nowIso);
        }

        this.scrollToBottom();
        setTimeout(() => this.observarElementosMensagens(), 80);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.snackBar.open(this.extrairMensagemErro(err, 'Erro ao enviar mensagem criptografada'), 'Fechar', { duration: 4000 });
        this.enviando = false;
        this.cdr.markForCheck();
      }
    });
  }

  private atualizarResumoConversaNaLista(conversationId: string, lastMessage: string, lastMessageAt: string) {
    const idx = this.conversas.findIndex((c) => c.id === conversationId);
    if (idx === -1) return;
    const updated: ConversationItem = {
      ...this.conversas[idx],
      lastMessage,
      lastMessageAt,
      unreadCount: 0,
    };
    const nextList = [updated, ...this.conversas.filter((_, i) => i !== idx)];
    this.conversas = nextList;
    if (this.conversaAtiva?.id === conversationId) {
      this.conversaAtiva = updated;
    }
    this.aplicarFiltroConversas();
  }

  private extrairMensagemErro(err: any, fallback: string): string {
    const apiMsg = err?.error?.message;
    if (Array.isArray(apiMsg) && apiMsg.length > 0) {
      return apiMsg.join(', ');
    }
    if (typeof apiMsg === 'string' && apiMsg.trim()) {
      return apiMsg;
    }
    if (typeof err?.message === 'string' && err.message.trim()) {
      return err.message;
    }
    return fallback;
  }

  baixarAnexo(anexo: any) {
    if (anexo.data) {
      const a = document.createElement('a');
      a.href = anexo.data;
      a.download = anexo.name || 'anexo';
      a.click();
    } else if (anexo.url) {
      window.open(anexo.url, '_blank');
    }
  }

  isImagem(type?: string, name?: string): boolean {
    if (type && type.startsWith('image/')) return true;
    if (name && /\.(png|jpe?g|gif|webp|svg)$/i.test(name)) return true;
    return false;
  }

  isAnexoPlaceholder(content?: string): boolean {
    if (!content) return false;
    return content.startsWith('[Anexo') || content.endsWith('Anexos]');
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}
