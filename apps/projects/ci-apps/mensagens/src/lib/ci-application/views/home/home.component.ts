import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

  constructor(
    private messagerService: EncryptedMessagerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver
  ) {}

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
        this.conversas = res || [];
        this.aplicarFiltroConversas();
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

  carregarMensagens(conversationId: string) {
    this.loadingMensagens = true;
    this.messagerService.listarMensagens(conversationId).subscribe({
      next: (res) => {
        this.mensagens = res || [];
        this.loadingMensagens = false;
        this.scrollToBottom();
      },
      error: () => {
        this.loadingMensagens = false;
      }
    });
  }

  carregarMensagensSilencioso(conversationId: string) {
    this.messagerService.listarMensagens(conversationId).subscribe({
      next: (res) => {
        const countAnterior = this.mensagens.length;
        this.mensagens = res || [];
        if (this.mensagens.length > countAnterior) {
          this.scrollToBottom();
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
    if (!keyboardEvent.shiftKey) {
      event.preventDefault();
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
        this.textoMensagem = '';
        this.anexosPendentes = [];
        this.enviando = false;
        if (this.conversaAtiva) {
          this.conversaAtiva.lastMessage = texto || '[Anexo enviado]';
          this.conversaAtiva.lastMessageAt = new Date().toISOString();
        }
        this.scrollToBottom();
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
