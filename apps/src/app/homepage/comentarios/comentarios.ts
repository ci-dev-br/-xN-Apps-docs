import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule } from "@angular/router";
import { formatUserPhotoUrl, UserAuthenticationService } from "@ci/auth";
import { NewsCommentItem, NewsService, User } from "@ci/portal-api";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: 'ci-post-coments',
    templateUrl: './comentarios.html',
    styleUrls: ['./comentarios.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatSnackBarModule,
        RouterModule,
    ]
})
export class ComentariosComponent implements OnInit, OnDestroy {
    private _newsId?: string;

    @Input()
    set newsId(val: string) {
        if (this._newsId === val) return;
        this._newsId = val;
        this.comments = [];
        this.newCommentText = '';
        if (val) {
            this.carregarComentarios();
        }
    }
    get newsId(): string {
        return this._newsId || '';
    }

    @Input() feed: any;
    @Output() commentCountChange = new EventEmitter<number>();

    comments: NewsCommentItem[] = [];
    loading = false;
    sending = false;
    newCommentText = '';
    anonymousNickname = '';
    isLoggedIn = false;
    currentUser?: User;
    anonymousUser?: any;

    private destroy$ = new Subject<void>();

    constructor(
        @Optional() private readonly newsService?: NewsService,
        @Optional() private readonly userService?: UserAuthenticationService,
        @Optional() private readonly snackBar?: MatSnackBar,
        @Optional() private readonly cdr?: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        if (this.newsService && typeof this.newsService.getAnonymousAuthorName === 'function') {
            this.anonymousNickname = this.newsService.getAnonymousAuthorName() || '';
        }

        this.userService?.user
            ?.pipe(takeUntil(this.destroy$))
            ?.subscribe(u => {
                this.currentUser = u;
                this.isLoggedIn = !!u && !!u.id;
                if (!this.isLoggedIn) {
                    this.inicializarSessaoAnonima();
                }
                this.cdr?.markForCheck();
            });

        if (!this.isLoggedIn) {
            this.inicializarSessaoAnonima();
        }

        if (this.newsId) {
            this.carregarComentarios();
        }
    }

    private inicializarSessaoAnonima(): void {
        if (!this.newsService || typeof this.newsService.initAnonymousSession !== 'function') return;
        this.newsService.initAnonymousSession(this.anonymousNickname || undefined)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res?.user) {
                        this.anonymousUser = res.user;
                        this.cdr?.markForCheck();
                        this.cdr?.detectChanges();
                    }
                },
                error: () => { }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    carregarComentarios() {
        if (!this.newsService || !this.newsId) return;
        this.loading = true;
        this.cdr?.markForCheck();

        this.newsService.getComments(this.newsId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (items) => {
                    this.comments = items || [];
                    this.loading = false;
                    this.commentCountChange.emit(this.comments.length);
                    this.cdr?.markForCheck();
                    this.cdr?.detectChanges();
                },
                error: (err) => {
                    console.error('Erro ao carregar comentários:', err);
                    this.loading = false;
                    this.cdr?.markForCheck();
                    this.cdr?.detectChanges();
                }
            });
    }

    enviarComentario() {
        const texto = this.newCommentText.trim();
        if (!texto || this.sending || !this.newsService || !this.newsId) return;

        this.sending = true;
        this.cdr?.markForCheck();

        const apelidoAnon = !this.isLoggedIn ? (this.anonymousNickname?.trim() || undefined) : undefined;
        this.newsService.comment(this.newsId, texto, apelidoAnon)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (novoComentario) => {
                    this.comments = [...this.comments, novoComentario];
                    if (!this.isLoggedIn && novoComentario?.user) {
                        this.anonymousUser = novoComentario.user;
                    }
                    this.newCommentText = '';
                    this.sending = false;
                    this.commentCountChange.emit(this.comments.length);
                    this.snackBar?.open('Comentário publicado!', 'Ok', { duration: 2500 });
                    this.cdr?.markForCheck();
                    this.cdr?.detectChanges();
                },
                error: (err) => {
                    console.error('Erro ao publicar comentário:', err);
                    this.sending = false;
                    this.snackBar?.open('Não foi possível enviar o comentário. Tente novamente.', 'Fechar', { duration: 3500 });
                    this.cdr?.markForCheck();
                    this.cdr?.detectChanges();
                }
            });
    }

    isAnonymousAuthor(user: any): boolean {
        if (!user) return true;
        if (Array.isArray(user.roles) && user.roles.includes('ANONYMOUS')) return true;
        return typeof user.username === 'string' && user.username.startsWith('anon_');
    }

    getActiveActor(): any {
        return this.isLoggedIn ? this.currentUser : this.anonymousUser;
    }

    onEnterPressed(event: Event) {
        const kb = event as KeyboardEvent;
        if (kb && kb.ctrlKey) {
            this.enviarComentario();
        }
    }

    /**
     * Segue ou deixa de seguir o autor do comentário, gerenciando o vínculo social
     * de seguidor e conhecido mútuo.
     */
    alternarSeguir(author: any, event?: Event) {
        event?.stopPropagation();

        if (!this.isLoggedIn) {
            this.snackBar?.open('Faça login para seguir outros leitores.', 'Entrar', { duration: 3500 })
                .onAction().subscribe(() => {
                    window.location.href = '/acessar';
                });
            return;
        }

        if (!author || !author.id || !this.newsService) return;

        const nome = author.surname || author.fullName || author.username || 'o usuário';
        const isFollowing = author.socialStatus?.isFollowing;

        if (isFollowing) {
            const confirmar = confirm(`Deseja deixar de seguir ${nome}?`);
            if (!confirmar) return;

            this.newsService.unfollowUser(author.id).subscribe({
                next: () => {
                    this.atualizarStatusSocialAutor(author.id, {
                        isFollowing: false,
                        isConhecido: false,
                        isFollower: author.socialStatus?.isFollower ?? false,
                        tipo: author.socialStatus?.isFollower ? 'SEGUIDOR' : 'NENHUM',
                    });
                    this.snackBar?.open(`Você deixou de seguir ${nome}.`, 'Ok', { duration: 3000 });
                },
                error: (err) => {
                    console.error('Erro ao deixar de seguir:', err);
                    this.snackBar?.open('Erro ao atualizar vínculo.', 'Fechar', { duration: 3000 });
                }
            });
        } else {
            this.newsService.followUser(author.id).subscribe({
                next: (resp) => {
                    const eraFollower = author.socialStatus?.isFollower;
                    const novoTipo = eraFollower ? 'CONHECIDO' : 'SEGUINDO';

                    this.atualizarStatusSocialAutor(author.id, {
                        isFollowing: true,
                        isConhecido: eraFollower,
                        isFollower: eraFollower,
                        tipo: novoTipo,
                    });

                    if (eraFollower) {
                        this.snackBar?.open(`Agora você e ${nome} são conhecidos! 🎉 Conexão mútua estabelecida.`, 'Ok', { duration: 4500 });
                    } else {
                        this.snackBar?.open(`Você agora está seguindo ${nome}.`, 'Ok', { duration: 3000 });
                    }
                },
                error: (err) => {
                    console.error('Erro ao seguir:', err);
                    this.snackBar?.open('Erro ao seguir usuário.', 'Fechar', { duration: 3000 });
                }
            });
        }
    }

    private atualizarStatusSocialAutor(authorId: string, novoStatus: any) {
        this.comments = this.comments.map(c => {
            if (c.user?.id === authorId) {
                return {
                    ...c,
                    socialStatus: {
                        ...c.socialStatus,
                        ...novoStatus,
                    }
                };
            }
            return c;
        });
    }

    getAuthorPhoto(user: any): string | null {
        return formatUserPhotoUrl(user?.photo);
    }

    getAuthorInitials(user: any): string {
        if (!user) return '?';
        const name = user.surname || user.fullName || user.username || '';
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase() || '?';
    }
}