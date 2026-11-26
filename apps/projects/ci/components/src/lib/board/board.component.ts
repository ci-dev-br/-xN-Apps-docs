import {
    ChangeDetectorRef,
    Component,
    HostListener,
    Inject,
    Injector,
    Input,
    OnInit,
    Optional
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { UserAuthenticationService } from "@ci/auth";
import { DaoBuilder, DaoService } from "@ci/core";
import { Card, Prancheta, PranchetaService } from "@ci/portal-api";
import { lastValueFrom } from "rxjs";
import { CardSetting, ImplCard } from "./card";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { WindowService } from "../window/src/window.service";
import { CardFinderComponent } from "../card-finder/card-finder.component";
import { SettingsComponent } from "@ci/components/settings";
import { ActivatedRoute } from "@angular/router";
import { organizeCardMetadata } from "./cards.registry";

/**
 * Componente de Visualização de Prancheta para construção de Dashboards
 * dinâmico com Cartões Extensíveis e Configuráveis por Multi-Inquilinos
 * com suporte a escopos de compartilhamento (Privado vs Tenant) e personalização de layout.
 */
@Component({
    selector: 'ci-board',
    templateUrl: 'board.component.html',
    styleUrl: 'board.component.scss',
    standalone: false,
})
export class BoardComponent implements OnInit {
    form?: FormGroup;

    @Input() default?: string;
    @Input() scope: 'USER' | 'TENANT' = 'USER';
    @Input() allowCustomization: boolean = true;
    @Input() customTitle?: string;

    cards = new Map<string, ImplCard>();
    prancheta?: Prancheta;
    synchronizing?: boolean;
    isCustomizingLayout: boolean = false;
    edittingCard?: Card;

    constructor(
        @Optional() private readonly window?: WindowService,
        @Optional() private readonly daoForms?: DaoBuilder,
        @Optional() private readonly user?: UserAuthenticationService,
        @Optional() private readonly pranchetas?: PranchetaService,
        @Optional() private readonly daos?: DaoService,
        @Optional() private readonly dialog?: MatDialog,
        @Optional() private readonly injector?: Injector,
        @Optional() @Inject(CardSetting) public cardsFound?: ImplCard[],
        @Optional() private route?: ActivatedRoute,
        @Optional() private cdr?: ChangeDetectorRef,
    ) {
        this.indexCards();

        this.route?.data.subscribe(async (data: any) => {
            if (data?.DefaultBoard) {
                this.default = data.DefaultBoard;
                await this.loadBoard();
            }
            if (data?.BoardScope) {
                this.scope = data.BoardScope;
            }
        });
    }

    private indexCards(): void {
        this.cardsFound?.forEach(c => {
            if (c?.componentName) {
                const organized = organizeCardMetadata(c);
                this.cards.set(c.componentName, organized);
            }
        });
    }

    async ngOnInit() {
        try {
            await this.loadBoard();
            this.form = await this.daoForms?.getForm('Prancheta');
            this.daos?.prepareToEdit(this.prancheta);
            if (this.form && this.prancheta) {
                this.daos?.bindDataForm(this.prancheta, this.form);
            }

            this.daos?.confirmation(this.prancheta)?.subscribe(async data => {
                this.synchronizing = true;
                try {
                    if (this.prancheta && data && this.form && this.pranchetas) {
                        const prancheta: any = { ...this.prancheta };
                        delete prancheta.__confirmation_subject;
                        const prancheta_syncronized = await lastValueFrom(
                            this.pranchetas.pranchetaControllerSync({ body: { prancheta: prancheta } })
                        );

                        const _data: any = Object.assign(this.prancheta, prancheta_syncronized);
                        this.daos?.prepareToEdit(_data);
                        this.daos?.bindDataForm(_data, this.form);
                        this.prancheta = _data;
                    }
                } catch (error) {
                    console.trace(error);
                }
                this.synchronizing = false;
                this.cdr?.markForCheck();
            });

            this.form?.valueChanges.subscribe(() => {
                if (!this.synchronizing) {
                    this.syncPrancheta();
                }
            });
        } catch (error) {
            console.trace(error);
        }
    }

    private getStorageKey(): string {
        const userId = this.user?.user?.value?.id || 'guest';
        return `ci_board_${this.default || 'default'}_${this.boardScope}_${userId}`;
    }

    async loadBoard(): Promise<void> {
        let loaded: Prancheta | null = null;

        // 1. Tenta carregar do backend caso serviço esteja disponível
        if (this.pranchetas) {
            try {
                loaded = await lastValueFrom(
                    this.pranchetas.pranchetaControllerGet({
                        body: {
                            defaultGlobalCode: this.default,
                            scope: this.scope
                        }
                    })
                );
            } catch (err) {
                console.warn('Servidor indisponível, recorrendo ao cache local do board:', err);
            }
        }

        // 2. Se não encontrou no backend, tenta carregar do localStorage
        if (!loaded) {
            try {
                const cached = localStorage.getItem(this.getStorageKey());
                if (cached) {
                    loaded = JSON.parse(cached);
                }
            } catch {}
        }

        // 3. Se ainda não existe, cria a estrutura inicial
        if (!loaded) {
            loaded = {
                title: this.customTitle || (this.default === 'HOMEPAGE_USER_BOARD' ? 'Meu Board' : 'Meu Painel Operacional'),
                codigoGlobal: this.default,
                scope: this.scope,
                layout: {
                    type: 'grid',
                    columns: 3,
                    gap: 'normal',
                },
                cards: []
            };

            // Popula cards iniciais sugeridos se for board da homepage
            if (this.default === 'HOMEPAGE_USER_BOARD' || !this.default) {
                loaded.cards = this.getDefaultInitialCards();
            }

            if (this.pranchetas) {
                try {
                    const saved = await lastValueFrom(
                        this.pranchetas.pranchetaControllerSync({ body: { prancheta: loaded } })
                    );
                    if (saved) loaded = saved;
                } catch {}
            }
        }

        if (!loaded) {
            loaded = { cards: [] };
        }

        // Garante que o layout tenha valores padrão consistentes
        if (!loaded.layout) {
            loaded.layout = { type: 'grid', columns: 3, gap: 'normal' };
        } else if (typeof loaded.layout === 'string') {
            try {
                loaded.layout = JSON.parse(loaded.layout);
            } catch {
                loaded.layout = { type: 'grid', columns: 3, gap: 'normal' };
            }
        }

        if (this.scope && !loaded.scope) {
            loaded.scope = this.scope;
        }

        this.prancheta = loaded;
        this.saveToStorage();
        this.cdr?.markForCheck();
    }

    private getDefaultInitialCards(): Card[] {
        const defaults: Card[] = [];
        const candidates = ['MacroIndicatorsCard', 'RecentQuotesCard', 'CalendarComponent', 'CardTerminalComponent'];

        for (const name of candidates) {
            if (this.cards.has(name)) {
                const def = this.cards.get(name)!;
                defaults.push({
                    componentName: name,
                    componentVersion: def.componentVersion || '1.0.0',
                    settings: def.settings || {},
                    cols: def.dimensions?.cols || 2,
                    title: def.title
                });
            }
        }
        return defaults;
    }

    private saveToStorage(): void {
        if (!this.prancheta) return;
        try {
            localStorage.setItem(this.getStorageKey(), JSON.stringify(this.prancheta));
        } catch {}
    }

    async syncPrancheta(): Promise<void> {
        if (!this.prancheta) return;

        this.saveToStorage();

        if (this.pranchetas && !this.synchronizing) {
            this.synchronizing = true;
            try {
                const pranchetaToSend: any = { ...this.prancheta };
                delete pranchetaToSend.__confirmation_subject;
                const synced = await lastValueFrom(
                    this.pranchetas.pranchetaControllerSync({ body: { prancheta: pranchetaToSend } })
                );
                if (synced?.internalId) {
                    this.prancheta.internalId = synced.internalId;
                }
            } catch (err) {
                console.warn('Erro ao sincronizar prancheta com o servidor:', err);
            } finally {
                this.synchronizing = false;
                this.cdr?.markForCheck();
            }
        }
    }

    get layoutColumns(): number | 'auto' {
        return this.prancheta?.layout?.columns || 3;
    }

    setColumns(cols: number | 'auto'): void {
        if (!this.prancheta) return;
        if (!this.prancheta.layout) this.prancheta.layout = {};
        this.prancheta.layout.columns = cols;
        this.syncPrancheta();
    }

    get layoutGap(): 'compact' | 'normal' | 'spacious' {
        return this.prancheta?.layout?.gap || 'normal';
    }

    setGap(gap: 'compact' | 'normal' | 'spacious'): void {
        if (!this.prancheta) return;
        if (!this.prancheta.layout) this.prancheta.layout = {};
        this.prancheta.layout.gap = gap;
        this.syncPrancheta();
    }

    get boardScope(): 'USER' | 'TENANT' {
        return (this.prancheta?.scope as any) || this.scope || 'USER';
    }

    toggleScope(): void {
        if (!this.prancheta) return;
        const newScope = this.boardScope === 'USER' ? 'TENANT' : 'USER';
        this.prancheta.scope = newScope;
        this.scope = newScope;
        this.syncPrancheta();
    }

    toggleCustomizingLayout(): void {
        this.isCustomizingLayout = !this.isCustomizingLayout;
    }

    drop(event: CdkDragDrop<Card[]>): void {
        if (!this.prancheta?.cards) return;
        moveItemInArray(this.prancheta.cards, event.previousIndex, event.currentIndex);
        this.syncPrancheta();
    }

    async findCardToAdd(): Promise<void> {
        const alreadyAdded = (this.prancheta?.cards || [])
            .map(c => c.componentName)
            .filter(Boolean) as string[];

        const dialogRef = this.dialog?.open(CardFinderComponent, {
            width: '840px',
            maxWidth: '94vw',
            data: {
                alreadyAddedCardNames: alreadyAdded,
            }
        });

        dialogRef?.afterClosed().subscribe((selectedCard: ImplCard) => {
            if (selectedCard && this.prancheta) {
                if (!this.prancheta.cards) this.prancheta.cards = [];

                if (!this.prancheta.cards.some(c => c.componentName === selectedCard.componentName)) {
                    this.prancheta.cards.push({
                        componentName: selectedCard.componentName,
                        componentVersion: selectedCard.componentVersion || '1.0.0',
                        settings: selectedCard.settings || {},
                        cols: selectedCard.dimensions?.cols || 1,
                        title: selectedCard.title
                    });
                    this.syncPrancheta();
                }
            }
        });
    }

    resetDefaultBoard(): void {
        if (!this.prancheta) return;
        this.prancheta.cards = this.getDefaultInitialCards();
        this.prancheta.layout = { type: 'grid', columns: 3, gap: 'normal' };
        this.syncPrancheta();
    }

    component(card: Card): ImplCard | undefined {
        try {
            return this.cards.get(card.componentName || '');
        } catch {
            return undefined;
        }
    }

    async openSettings(): Promise<void> {
        this.window?.open(
            SettingsComponent,
            { pranchetas: [this.prancheta] },
            'Editar Pranchetas'
        );
    }
}
