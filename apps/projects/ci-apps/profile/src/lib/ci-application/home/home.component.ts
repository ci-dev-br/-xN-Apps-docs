import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { AuthModule, UserAuthenticationService } from '@ci/auth';
import { CoreModule, DaoService } from '@ci/core';
import { Application, ApplicationService, User, UserService } from '@ci/portal-api';
import { lastValueFrom, Subscription } from 'rxjs';

export interface IAppItem {
    id?: string;
    name: string;
    shortDescription: string;
    description?: string;
    categoria: string;
    color: string;
    url: string;
    icon: string;
    roles?: string[];
    isAvailable: boolean;
}

export interface ISubscriptionPlan {
    id: string;
    name: string;
    tag: string;
    description: string;
    price: string;
    recurrence: string;
    features: string[];
    isCurrent: boolean;
    status: 'Ativa' | 'Disponível';
    badgeColor: string;
}

@Component({
    selector: 'ci-home',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        MatChipsModule,
        MatTooltipModule,
        MatTabsModule,
        MatProgressBarModule,
        MatDividerModule,
        RouterModule,
        CoreModule,
        AuthModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
    protected user?: User;
    protected profileImage?: string;
    protected isSaving = false;
    protected feedbackMessage?: { text: string; type: 'success' | 'error' | 'info' };

    // Formulário de perfil
    form: FormGroup = this.formBuilder.group({
        id: [{ value: '', disabled: true }],
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        surname: [''],
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        emailVerificado: [{ value: false, disabled: true }],
        photo: [null],
        roles: [[]],
        tenants: [[]],
        createdAt: [{ value: null, disabled: true }],
        updatedAt: [{ value: null, disabled: true }],
    });

    // Câmera & Upload
    @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
    @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;
    @ViewChild('canvasElement') canvasElement?: ElementRef<HTMLCanvasElement>;
    videoStream: MediaStream | null = null;
    capturedImage: string | null = null;
    isCameraActive = false;

    // Assinaturas
    protected activeSubscriptions: ISubscriptionPlan[] = [];
    protected availablePlans: ISubscriptionPlan[] = [];

    // Aplicativos
    protected availableApps: IAppItem[] = [];
    protected filteredApps: IAppItem[] = [];
    protected appSearchTerm = '';
    protected selectedAppCategory = 'Todos';
    protected appCategories: string[] = ['Todos'];
    protected loadingApps = false;

    private authSubscription?: Subscription;

    constructor(
        private readonly formBuilder: FormBuilder,
        @Optional() private readonly daos?: DaoService,
        @Optional() private readonly userService?: UserService,
        @Optional() private readonly authUserService?: UserAuthenticationService,
        @Optional() private readonly applicationService?: ApplicationService,
    ) { }

    ngOnInit(): void {
        this.initPlansCatalog();

        this.authSubscription = this.authUserService?.user.subscribe(user => {
            this.handleUserLoaded(user || undefined);
        });

        this.loadAvailableApps();
    }

    ngOnDestroy(): void {
        this.stopCamera();
        this.authSubscription?.unsubscribe();
    }

    /**
     * Trata o carregamento e inicialização dos dados do usuário.
     */
    private handleUserLoaded(user?: User) {
        if (!user) {
            this.user = undefined;
            this.profileImage = undefined;
            return;
        }

        this.user = user;
        this.profileImage = this.extractPhotoUrl(user.photo);

        this.form.patchValue({
            id: user.id || '',
            fullName: user.fullName || '',
            surname: user.surname || '',
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            emailVerificado: Boolean(user.emailVerificado),
            photo: user.photo || null,
            roles: user.roles || [],
            tenants: user.tenants || [],
            createdAt: user.createdAt || null,
            updatedAt: user.updatedAt || null,
        }, { emitEvent: false });

        this.daos?.prepareToEdit(user);
        if (this.form) {
            this.daos?.bindDataForm(user, this.form);
        }

        this.updateUserSubscriptions(user);
        this.filterApps();
    }

    /**
     * Extrai com segurança a URL base64 da foto de perfil.
     */
    private extractPhotoUrl(photo: any): string | undefined {
        if (!photo) return undefined;
        if (typeof photo === 'string') return photo;
        if (!photo.originalFile) return undefined;

        const file = photo.originalFile;
        if (typeof file === 'string' && file.startsWith('data:')) {
            return file;
        }

        const format = photo.format || 'data:image/jpeg;base64,';
        const prefix = format.includes('base64,')
            ? format
            : (format.endsWith(';') ? `${format}base64,` : `${format};base64,`);

        return `${prefix}${file}`;
    }

    /**
     * Salva as alterações do perfil do usuário e sincroniza com o backend e a sessão local.
     */
    async saveProfile() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.showFeedback('Por favor, preencha corretamente os campos obrigatórios.', 'error');
            return;
        }

        this.isSaving = true;
        this.feedbackMessage = undefined;

        try {
            const raw = this.form.getRawValue();
            const targetUser: User = {
                ...this.user,
                id: this.user?.id,
                fullName: raw.fullName?.trim() || '',
                surname: raw.surname?.trim() || '',
                username: raw.username?.trim() || '',
                email: raw.email?.trim() || '',
                phone: raw.phone?.trim() || '',
                photo: raw.photo !== undefined ? raw.photo : (this.user?.photo || null),
            };

            let responseUser: User | undefined;
            if (this.userService) {
                responseUser = await lastValueFrom(this.userService.sync({ body: targetUser }));
            }

            const mergedUser = responseUser ? Object.assign({}, this.user, responseUser) : targetUser;
            this.user = mergedUser;

            // Atualiza o estado reativo de autenticação global e o armazenamento local
            this.authUserService?.user.next(mergedUser);

            // Atualiza preview da imagem
            this.profileImage = this.extractPhotoUrl(mergedUser.photo);

            // Re-sincroniza o DAO
            this.daos?.prepareToEdit(mergedUser);
            if (this.form) {
                this.daos?.bindDataForm(mergedUser, this.form);
                this.form.markAsPristine();
                this.form.markAsUntouched();
            }

            this.showFeedback('Informações de perfil atualizadas com sucesso!', 'success');
        } catch (error: any) {
            console.error('Falha ao salvar dados de usuário:', error);
            this.showFeedback('Erro ao salvar dados de perfil. Tente novamente.', 'error');
        } finally {
            this.isSaving = false;
        }
    }

    // ==========================================
    // Gerenciamento de Foto (Upload & Câmera)
    // ==========================================

    triggerUpload() {
        this.fileInput?.nativeElement.click();
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        if (!file.type.startsWith('image/')) {
            this.showFeedback('Por favor, selecione um arquivo de imagem válido (JPEG, PNG, WEBP).', 'error');
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            this.showFeedback('O arquivo é muito grande. O limite máximo permitido é 15MB.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const rawDataUrl = e.target?.result as string;
            if (rawDataUrl) {
                const optimized = await this.resizeAndOptimizeImage(rawDataUrl, 400, 0.88);
                this.applyPhotoDataUrl(optimized);
            }
        };
        reader.readAsDataURL(file);
        input.value = '';
    }

    removePhoto() {
        this.profileImage = undefined;
        this.form.get('photo')?.setValue(null);
        this.form.get('photo')?.markAsDirty();
        this.form.get('photo')?.markAsTouched();
        this.form.markAsDirty();
        this.showFeedback('Foto de perfil removida. Clique em "Confirmar alterações" para salvar.', 'info');
    }

    async startCamera() {
        this.isCameraActive = true;
        this.capturedImage = null;
        try {
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' }
            });
            setTimeout(() => {
                const video = this.videoElement?.nativeElement;
                if (video && this.videoStream) {
                    video.srcObject = this.videoStream;
                    video.play();
                }
            }, 100);
        } catch (error) {
            console.warn('Erro ao acessar webcam:', error);
            this.isCameraActive = false;
            this.showFeedback('Não foi possível acessar a câmera. Verifique as permissões do navegador.', 'error');
        }
    }

    capturePhoto() {
        if (!this.isCameraActive) return;
        const video = this.videoElement?.nativeElement;
        const canvas = this.canvasElement?.nativeElement;
        if (!video || !canvas) return;

        const context = canvas.getContext('2d');
        if (context) {
            const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
            const startX = ((video.videoWidth || 480) - size) / 2;
            const startY = ((video.videoHeight || 480) - size) / 2;
            canvas.width = size;
            canvas.height = size;
            context.drawImage(video, startX, startY, size, size, 0, 0, size, size);

            this.capturedImage = canvas.toDataURL('image/jpeg', 0.92);
        }
    }

    async confirmCapturedPhoto() {
        if (this.capturedImage) {
            const optimized = await this.resizeAndOptimizeImage(this.capturedImage, 400, 0.88);
            this.applyPhotoDataUrl(optimized);
            this.stopCamera();
        }
    }

    retakePhoto() {
        this.capturedImage = null;
        if (!this.videoStream) {
            this.startCamera();
        }
    }

    stopCamera() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
        this.isCameraActive = false;
        this.capturedImage = null;
    }

    /**
     * Redimensiona e centraliza a imagem em um quadrado de até 400x400 pixels em JPEG (0.88),
     * gerando payload leve (~40-60KB) e ideal para avatar responsivo.
     */
    private resizeAndOptimizeImage(dataUrl: string, maxDim = 400, quality = 0.88): Promise<string> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const width = img.naturalWidth || img.width;
                const height = img.naturalHeight || img.height;

                const minSide = Math.min(width, height);
                const startX = (width - minSide) / 2;
                const startY = (height - minSide) / 2;

                const targetSize = Math.min(maxDim, minSide);
                canvas.width = targetSize;
                canvas.height = targetSize;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, targetSize, targetSize);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                } else {
                    resolve(dataUrl);
                }
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        });
    }

    private applyPhotoDataUrl(dataUrl: string) {
        this.profileImage = dataUrl;
        const parts = dataUrl.split('base64,');
        const format = parts[0] + 'base64,';
        const originalFile = parts[1];

        this.form.get('photo')?.setValue({
            internalId: this.user?.photo?.internalId || undefined,
            format,
            originalFile,
        });
        this.form.get('photo')?.markAsDirty();
        this.form.get('photo')?.markAsTouched();
        this.form.markAsDirty();

        this.showFeedback('Nova foto selecionada! Lembre-se de confirmar as alterações.', 'info');
    }

    // ==========================================
    // Assinaturas e Planos
    // ==========================================

    private initPlansCatalog() {
        this.availablePlans = [
            {
                id: 'leitor-assiduo',
                name: 'Leitor Assíduo',
                tag: 'Hyppes Feed',
                description: 'Acesso completo a todos os artigos, publicações e notícias da comunidade.',
                price: 'R$ 0,10',
                recurrence: 'por mês',
                features: [
                    'Acesso ilimitado a conteúdos Hyppes',
                    'Feed personalizado por temas de interesse',
                    'Histórico e marcadores de leitura',
                    'Comentários e interações nas publicações'
                ],
                isCurrent: false,
                status: 'Disponível',
                badgeColor: '#0288d1'
            },
            {
                id: 'publicador',
                name: 'Publicador Pro',
                tag: 'Criação de Conteúdo',
                description: 'Crie, publique e monetize suas ideias e publicações técnicas para milhares de usuários.',
                price: 'R$ 1,99',
                recurrence: 'por mês',
                features: [
                    'Publicação ilimitada de artigos e matérias',
                    'Editor avançado com blocos dinâmicos',
                    'Analytics de leitura e engajamento',
                    'Selo de Publicador Verificado',
                    'Monetização por audiência e doações'
                ],
                isCurrent: false,
                status: 'Disponível',
                badgeColor: '#7b1fa2'
            },
            {
                id: 'passe-livre',
                name: 'Passe Livre Anual',
                tag: 'Acesso Global',
                description: 'Tenha acesso integral a todos os ecossistemas, aplicações e novidades em primeira mão.',
                price: 'R$ 0,01',
                recurrence: 'mês (R$ 0,12 / ano)',
                features: [
                    'Acesso a TODOS os aplicativos do CI Apps',
                    'Novos lançamentos liberados antecipadamente',
                    'Suporte prioritário da equipe de engenharia',
                    'Armazenamento em nuvem expandido',
                    'Integração com APIs externas sem limites'
                ],
                isCurrent: false,
                status: 'Disponível',
                badgeColor: '#2e7d32'
            }
        ];
    }

    private updateUserSubscriptions(user: User) {
        const roles = user.roles || ['USER'];
        this.activeSubscriptions = [];

        if (roles.includes('MASTER')) {
            this.activeSubscriptions.push({
                id: 'role-master',
                name: 'Desenvolvedor Master',
                tag: 'Nível Máximo',
                description: 'Acesso irrestrito a ferramentas de desenvolvimento, código-fonte e administração global.',
                price: 'Gratuito',
                recurrence: 'vitalício',
                features: [
                    'Acesso pleno a Codex, DevTools, Infra e CMS',
                    'Depuração de processos em tempo real',
                    'Gerenciamento de permissões de usuários',
                    'Auditoria de transações e logs'
                ],
                isCurrent: true,
                status: 'Ativa',
                badgeColor: '#c2185b'
            });
        }

        if (roles.includes('ADMIN')) {
            this.activeSubscriptions.push({
                id: 'role-admin',
                name: 'Administrador de Organização',
                tag: 'Corporativo',
                description: 'Controle gerencial, relatórios executivos e gestão financeira dos tenants vinculados.',
                price: 'Corporativo',
                recurrence: 'vigente',
                features: [
                    'Painel Gerencial e Indicadores em tempo real',
                    'Gestão de colaboradores e convites',
                    'Módulo Financeiro e de Vendas'
                ],
                isCurrent: true,
                status: 'Ativa',
                badgeColor: '#f57c00'
            });
        }

        // Assinatura padrão de todo usuário
        this.activeSubscriptions.push({
            id: 'role-user',
            name: 'Membro da Plataforma (Base)',
            tag: 'Padrão',
            description: 'Identidade verificada com acesso aos módulos fundamentais da suíte corporativa.',
            price: 'Incluso',
            recurrence: 'sem custos',
            features: [
                'Perfil público e identificação de usuário',
                'Acesso a Mensagens e Canais autorizados',
                'Armazenamento de dados pessoais e documentos'
            ],
            isCurrent: true,
            status: 'Ativa',
            badgeColor: '#1976d2'
        });
    }

    subscribePlan(plan: ISubscriptionPlan) {
        this.showFeedback(`Plano "${plan.name}" selecionado! Integração de assinatura em processamento.`, 'info');
    }

    // ==========================================
    // Aplicativos Disponíveis
    // ==========================================

    async loadAvailableApps() {
        this.loadingApps = true;
        try {
            let apiApps: Application[] = [];
            if (this.applicationService) {
                try {
                    apiApps = await lastValueFrom(this.applicationService.getList({ body: {} })) || [];
                } catch {
                    apiApps = [];
                }
            }

            const staticApps = this.getDefaultAppsCatalog();

            // Mescla os apps da API com os estáticos
            const mergedMap = new Map<string, IAppItem>();

            staticApps.forEach(app => mergedMap.set(app.name.toLowerCase(), app));

            apiApps.forEach(apiApp => {
                if (apiApp.name) {
                    const key = apiApp.name.toLowerCase();
                    const existing = mergedMap.get(key);
                    mergedMap.set(key, {
                        id: apiApp.id || existing?.id,
                        name: apiApp.name,
                        shortDescription: apiApp.description || existing?.shortDescription || '',
                        description: apiApp.description || existing?.description,
                        categoria: apiApp.categoria || existing?.categoria || 'Geral',
                        color: existing?.color || '#3f51b5',
                        url: apiApp.url || existing?.url || `/${apiApp.name}`,
                        icon: apiApp.icon || existing?.icon || 'apps',
                        roles: apiApp.roles || existing?.roles,
                        isAvailable: true
                    });
                }
            });

            this.availableApps = Array.from(mergedMap.values());

            // Extrai categorias únicas
            const categoriesSet = new Set<string>();
            this.availableApps.forEach(a => {
                if (a.categoria) categoriesSet.add(a.categoria);
            });
            this.appCategories = ['Todos', ...Array.from(categoriesSet).sort()];

            this.filterApps();
        } catch (error) {
            console.warn('Erro ao carregar aplicativos:', error);
            this.availableApps = this.getDefaultAppsCatalog();
            this.filterApps();
        } finally {
            this.loadingApps = false;
        }
    }

    filterApps() {
        const userRoles = this.user?.roles || ['USER'];
        const term = this.appSearchTerm.trim().toLowerCase();

        this.filteredApps = this.availableApps.filter(app => {
            // Valida permissão de acesso
            const hasRoleAccess = !app.roles || app.roles.length === 0 ||
                app.roles.some(role => userRoles.includes(role)) ||
                userRoles.includes('MASTER') || userRoles.includes('ADMIN');

            if (!hasRoleAccess) return false;

            // Filtro por categoria
            if (this.selectedAppCategory !== 'Todos' && app.categoria !== this.selectedAppCategory) {
                return false;
            }

            // Filtro por termo de busca
            if (term) {
                const matchName = app.name.toLowerCase().includes(term);
                const matchDesc = app.shortDescription?.toLowerCase().includes(term);
                const matchCat = app.categoria?.toLowerCase().includes(term);
                return matchName || matchDesc || matchCat;
            }

            return true;
        });
    }

    onCategoryChange(category: string) {
        this.selectedAppCategory = category;
        this.filterApps();
    }

    onSearchChange() {
        this.filterApps();
    }

    private getDefaultAppsCatalog(): IAppItem[] {
        return [
            {
                name: 'Arquivos',
                shortDescription: 'Armazenamento em nuvem, gestão de pastas, upload de mídias e auditoria de arquivos corporativos.',
                categoria: 'Sistema',
                color: '#3949ab',
                url: '/Arquivos',
                icon: 'folder_open',
                roles: ['USER', 'ADMIN', 'MASTER'],
                isAvailable: true
            },
            {
                name: 'Cadastros',
                shortDescription: 'Central de pessoas, clientes, fornecedores e parceiros com validação de dados em tempo real.',
                categoria: 'Gestão',
                color: '#00897b',
                url: '/Cadastros',
                icon: 'badge',
                roles: ['USER', 'ADMIN', 'MASTER'],
                isAvailable: true
            },
            {
                name: 'Codex',
                shortDescription: 'IDE e editor de código integrado no navegador com destaque de sintaxe e controle de scripts.',
                categoria: 'Desenvolvimento',
                color: '#8e24aa',
                url: '/Codex',
                icon: 'code',
                roles: ['MASTER'],
                isAvailable: true
            },
            {
                name: 'DevTools',
                shortDescription: 'Instrumentação, inspeção de requisições, diagnósticos de rede e testes de integridade da API.',
                categoria: 'Desenvolvimento',
                color: '#5c6bc0',
                url: '/DevTools',
                icon: 'terminal',
                roles: ['MASTER'],
                isAvailable: true
            },
            {
                name: 'Financeiro',
                shortDescription: 'Contas a pagar e receber, fluxo de caixa, conciliação e relatórios de saúde econômica.',
                categoria: 'Financeiro',
                color: '#2e7d32',
                url: '/Financeiro',
                icon: 'account_balance_wallet',
                roles: ['ADMIN', 'MASTER'],
                isAvailable: true
            },
            {
                name: 'Formulários',
                shortDescription: 'Construtor dinâmico de formulários para pesquisas, questionários e coleta inteligente de dados.',
                categoria: 'Produtividade',
                color: '#00acc1',
                url: '/Formularios',
                icon: 'assignment',
                roles: ['USER', 'ADMIN', 'MASTER'],
                isAvailable: true
            },
            {
                name: 'Gerencial',
                shortDescription: 'Painel executivo com dashboards de KPIs consolidados para tomadas de decisão estratégicas.',
                categoria: 'Gestão',
                color: '#f57c00',
                url: '/Gerencial',
                icon: 'insights',
                roles: ['ADMIN', 'MASTER'],
                isAvailable: true
            },
            {
                name: 'Mensagens',
                shortDescription: 'Comunicação instantânea, canais temáticos e colaboração direta entre membros da equipe.',
                categoria: 'Comunicação',
                color: '#039be5',
                url: '/Mensagens',
                icon: 'chat',
                roles: ['USER', 'ADMIN', 'MASTER'],
                isAvailable: true
            },
            {
                name: 'Projetos',
                shortDescription: 'Gestão de tarefas, prazos, acompanhamento em quadro kanban e work-items da organização.',
                categoria: 'Produtividade',
                color: '#d81b60',
                url: '/Projetos',
                icon: 'task_alt',
                roles: ['USER', 'ADMIN', 'MASTER'],
                isAvailable: true
            },
            {
                name: 'CMS',
                shortDescription: 'Gerenciamento de páginas, blogs, notícias e conteúdos dinâmicos do ecossistema de sites.',
                categoria: 'Conteúdo',
                color: '#6d4c41',
                url: '/cms',
                icon: 'article',
                roles: ['ADMIN', 'MASTER'],
                isAvailable: true
            },
            {
                name: 'Vendas',
                shortDescription: 'Controle de pedidos de venda, catálogo de produtos, orçamentos e conversão comercial.',
                categoria: 'Vendas',
                color: '#c2185b',
                url: '/Vendas',
                icon: 'shopping_bag',
                roles: ['USER', 'ADMIN', 'MASTER'],
                isAvailable: true
            },
            {
                name: 'CRM',
                shortDescription: 'Histórico de interações com clientes, funil de vendas, oportunidades e fidelização.',
                categoria: 'Vendas',
                color: '#e65100',
                url: '/crm',
                icon: 'connect_without_contact',
                roles: ['USER', 'ADMIN', 'MASTER'],
                isAvailable: true
            }
        ];
    }

    // ==========================================
    // Utilitários de Interface
    // ==========================================

    copyIdToClipboard() {
        const id = this.user?.id;
        if (id && navigator.clipboard) {
            navigator.clipboard.writeText(id).then(() => {
                this.showFeedback('ID do usuário copiado para a área de transferência!', 'info');
            });
        }
    }

    getUserInitials(): string {
        const name = this.user?.fullName || this.user?.username || 'U';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    private showFeedback(text: string, type: 'success' | 'error' | 'info') {
        this.feedbackMessage = { text, type };
        setTimeout(() => {
            if (this.feedbackMessage?.text === text) {
                this.feedbackMessage = undefined;
            }
        }, 6000);
    }
}
