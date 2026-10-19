import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { NovaConversaDialogComponent } from '../../dialogs/nova-conversa-dialog.component';

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
  private shieldTimeout?: any;

  constructor(
    private messagerService: EncryptedMessagerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver,
    private cdr: ChangeDetectorRef
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
    }, 1200);
  }

  ngOnInit() {
    this.carregarConversas();

    // Observa mudanças de tela para alternar o modo do drawer
    this.responsiveSub = this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe((state) => {
        this.isSmallScreen = state.matches;
      });

    // Inicia verificação periódica de novas mensagens
    this.pollingSub = interval(5000).subscribe(() => {
      this.atualizarConversasSilencioso();
      if (this.conversaAtiva) {
        this.carregarMensagensSilencioso(this.conversaAtiva.id);
      }
    });
  }

  ngOnDestroy() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
    if (this.responsiveSub) {
      this.responsiveSub.unsubscribe();
    }
    if (this.messageObserver) {
      this.messageObserver.disconnect();
    }
  }

  carregarConversas() {
    this.loadingConversas = true;
    this.messagerService.listarConversas().subscribe({
      next: (res) => {
        this.conversas = res || [];
        this.aplicarFiltroConversas();
        this.loadingConversas = false;
      },
      error: () => {
        this.loadingConversas = false;
      }
    });
  }

  atualizarConversasSilencioso() {
    this.messagerService.listarConversas().subscribe({
      next: (res) => {
        const novasConversas = res || [];
        const mudou = novasConversas.length !== this.conversas.length ||
          novasConversas.some((c, i) => c.lastMessageAt !== this.conversas[i]?.lastMessageAt || c.unreadCount !== this.conversas[i]?.unreadCount);
        if (mudou) {
          this.conversas = novasConversas;
          this.aplicarFiltroConversas();
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
    this.loadingMensagens = true;
    this.visibleMessageIds.clear();
    this.messagerService.listarMensagens(conversationId).subscribe({
      next: (res) => {
        this.mensagens = res || [];
        this.loadingMensagens = false;
        this.scrollToBottom();
        this.configurarIntersectionObserver();
      },
      error: () => {
        this.loadingMensagens = false;
      }
    });
  }

  carregarMensagensSilencioso(conversationId: string) {
    if (this.enviando) return;
    this.messagerService.listarMensagens(conversationId).subscribe({
      next: (res) => {
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
        this.snackBar.open(err.error?.message || 'Erro ao iniciar conversa', 'Ok', { duration: 3500 });
        this.loadingMensagens = false;
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
      const reader = new FileReader();
      reader.onload = () => {
        this.anexosPendentes.push({
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result as string,
        });
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
    const conversationId = this.conversaAtiva.id;
    const anexosParaEnviar = [...this.anexosPendentes];

    this.messagerService.enviarMensagem(conversationId, texto, anexosParaEnviar).subscribe({
      next: (novaMsg) => {
        this.mensagens.push(novaMsg);
        this.visibleMessageIds.add(novaMsg.id);
        this.textoMensagem = '';
        this.anexosPendentes = [];
        this.enviando = false;
        if (this.conversaAtiva) {
          this.conversaAtiva.lastMessage = texto || '[Anexo enviado]';
          this.conversaAtiva.lastMessageAt = new Date().toISOString();
        }
        this.scrollToBottom();
        setTimeout(() => this.observarElementosMensagens(), 80);
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Erro ao enviar mensagem criptografada', 'Fechar', { duration: 3500 });
        this.enviando = false;
      }
    });
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
