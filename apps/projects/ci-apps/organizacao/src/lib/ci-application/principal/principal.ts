import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, OnDestroy, OnInit, Optional } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
import { UserAuthenticationService } from "@ci/auth";
import { EditarDetailComponent } from "@ci/components/editar-detail";
import { WindowModule, WindowService } from "@ci/components/window";
import { CoreModule } from "@ci/core";
import {
    AuthService,
    OrganizacaoDetalhesDto,
    OrganizacaoMembroDto,
    OrganizacaoResumoDto,
    OrganizacaoRoleDto,
    OrganizacaoService,
    OrganizacaoUsuarioBuscaDto,
    User,
} from "@ci/portal-api";
import { lastValueFrom, Subscription } from "rxjs";

@Component({
    selector: 'ci-org-principal',
    templateUrl: 'principal.html',
    styleUrl: 'principal.scss',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CoreModule,
        WindowModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatChipsModule,
        MatTabsModule,
        MatDividerModule,
        MatCheckboxModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTooltipModule,
    ],
})
export class Principal implements OnInit, OnDestroy {
    loading = true;
    saving = false;
    loadingDetails = false;
    activeTabIndex = 0;

    currentUser?: User;
    organizacoes: OrganizacaoResumoDto[] = [];
    selectedOrg?: OrganizacaoDetalhesDto;

    // Criação de nova organização
    showCreateForm = false;
    newOrgForm = {
        organizatioName: '',
        description: '',
        cnpj: '',
        website: '',
    };

    // Edição dos dados da organização selecionada
    editOrgForm = {
        organizatioName: '',
        description: '',
        cnpj: '',
        website: '',
    };

    // Roles personalizados ORG*
    newRoleForm = {
        name: '',
        description: '',
    };

    // Compartilhamento via Tenant
    userSearchTerm = '';
    searchedUsers: OrganizacaoUsuarioBuscaDto[] = [];
    selectedShareUser?: OrganizacaoUsuarioBuscaDto;
    shareSelectedRoles: string[] = ['ORG_MEMBRO'];
    customInlineRole = '';

    // Edição de roles por membro
    editingMemberId?: string;
    editingMemberRoles: string[] = [];

    private subs: Subscription[] = [];

    constructor(
        @Optional() private readonly window?: WindowService,
        @Optional() private readonly organizacao?: OrganizacaoService,
        @Optional() private readonly userAuth?: UserAuthenticationService,
        @Optional() private readonly authService?: AuthService,
        @Optional() private readonly snackBar?: MatSnackBar,
        @Optional() private readonly cdr?: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        if (this.userAuth?.user) {
            this.subs.push(
                this.userAuth.user.subscribe(u => {
                    this.currentUser = u;
                    this.cdr?.markForCheck();
                })
            );
        }
        this.carregarOrganizacoes();
    }

    ngOnDestroy(): void {
        this.subs.forEach(s => s.unsubscribe());
    }

    get canManageSelectedOrg(): boolean {
        if (!this.selectedOrg) return false;
        if (this.selectedOrg.isOwner) return true;
        if (this.selectedOrg.myRoles?.includes('ORG_ADMIN')) return true;
        const sysRoles = this.currentUser?.roles || [];
        return sysRoles.includes('MASTER') || sysRoles.includes('ADMIN');
    }

    get previewRoleCode(): string {
        return this.formatOrgRolePreview(this.newRoleForm.name);
    }

    get previewInlineRoleCode(): string {
        return this.formatOrgRolePreview(this.customInlineRole);
    }

    formatOrgRolePreview(rawName: string): string {
        const trimmed = (rawName || '').trim();
        if (!trimmed) return 'ORG_...';
        const ascii = trimmed
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9_\-\s]+/g, '')
            .trim()
            .replace(/[\s\-]+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '')
            .toUpperCase();
        if (!ascii || ascii === 'ORG' || ascii === 'ORG_') return 'ORG_...';
        if (ascii.startsWith('ORG')) return ascii;
        return `ORG_${ascii}`;
    }

    async carregarOrganizacoes(selectOrgId?: string): Promise<void> {
        if (!this.organizacao || typeof this.organizacao.minhasOrganizacoes !== 'function') {
            this.loading = false;
            return;
        }
        this.loading = true;
        this.cdr?.markForCheck();
        try {
            this.organizacoes = (await lastValueFrom(this.organizacao.minhasOrganizacoes())) || [];
            const targetId = selectOrgId || this.selectedOrg?.internalId || this.organizacoes[0]?.internalId;
            if (targetId && this.organizacoes.some(o => o.internalId === targetId)) {
                await this.selecionarOrganizacao(targetId);
            } else {
                this.selectedOrg = undefined;
            }
        } catch (err: any) {
            this.notificar(err?.error?.message || 'Erro ao carregar organizações.', true);
        } finally {
            this.loading = false;
            this.cdr?.markForCheck();
        }
    }

    async selecionarOrganizacao(organizacaoId: string): Promise<void> {
        if (!organizacaoId || !this.organizacao || typeof this.organizacao.obterDetalhes !== 'function') return;
        this.loadingDetails = true;
        this.editingMemberId = undefined;
        this.cdr?.markForCheck();
        try {
            const detalhes = await lastValueFrom(this.organizacao.obterDetalhes(organizacaoId));
            this.selectedOrg = detalhes;
            this.editOrgForm = {
                organizatioName: detalhes?.organizatioName || '',
                description: detalhes?.description || '',
                cnpj: detalhes?.cnpj || '',
                website: detalhes?.website || '',
            };
            const defaultRole = detalhes?.orgRoles?.find(r => r.code === 'ORG_MEMBRO')?.code || detalhes?.orgRoles?.[0]?.code;
            this.shareSelectedRoles = defaultRole ? [defaultRole] : ['ORG_MEMBRO'];
        } catch (err: any) {
            this.notificar(err?.error?.message || 'Não foi possível carregar os detalhes da organização.', true);
        } finally {
            this.loadingDetails = false;
            this.cdr?.markForCheck();
        }
    }

    abrirFormularioCriacao(): void {
        this.showCreateForm = true;
        this.newOrgForm = { organizatioName: '', description: '', cnpj: '', website: '' };
    }

    cancelarCriacao(): void {
        this.showCreateForm = false;
    }

    async criarNovaOrganizacao(): Promise<void> {
        const nome = (this.newOrgForm.organizatioName || '').trim();
        if (!nome || !this.organizacao) {
            this.notificar('Informe o nome da organização.', true);
            return;
        }
        this.saving = true;
        this.cdr?.markForCheck();
        try {
            const created = await lastValueFrom(
                this.organizacao.criarOrganizacao({
                    organizatioName: nome,
                    description: this.newOrgForm.description?.trim() || undefined,
                    cnpj: this.newOrgForm.cnpj?.trim() || undefined,
                    website: this.newOrgForm.website?.trim() || undefined,
                })
            );
            this.showCreateForm = false;
            this.notificar(`Organização "${created.organizatioName}" criada com Tenant isolado!`);
            await this.atualizarPerfilSessao();
            await this.carregarOrganizacoes(created.internalId || undefined);
        } catch (err: any) {
            this.notificar(err?.error?.message || err?.message || 'Falha ao criar organização.', true);
        } finally {
            this.saving = false;
            this.cdr?.markForCheck();
        }
    }

    async salvarDadosOrganizacao(): Promise<void> {
        if (!this.selectedOrg?.internalId || !this.organizacao) return;
        const nome = (this.editOrgForm.organizatioName || '').trim();
        if (!nome) {
            this.notificar('O nome da organização é obrigatório.', true);
            return;
        }
        this.saving = true;
        this.cdr?.markForCheck();
        try {
            this.selectedOrg = await lastValueFrom(
                this.organizacao.atualizarOrganizacao(this.selectedOrg.internalId, {
                    organizatioName: nome,
                    description: this.editOrgForm.description?.trim() || undefined,
                    cnpj: this.editOrgForm.cnpj?.trim() || undefined,
                    website: this.editOrgForm.website?.trim() || undefined,
                })
            );
            this.notificar('Dados da organização atualizados.');
            await this.carregarOrganizacoes(this.selectedOrg.internalId || undefined);
        } catch (err: any) {
            this.notificar(err?.error?.message || 'Erro ao atualizar organização.', true);
        } finally {
            this.saving = false;
            this.cdr?.markForCheck();
        }
    }

    async editarNoSchema(event?: MouseEvent): Promise<void> {
        if (!this.window || !this.selectedOrg) return;
        await this.window.open(
            EditarDetailComponent,
            { schemaName: 'Organizacao', data: this.selectedOrg },
            'Organizacao',
            event
        );
        if (this.selectedOrg.internalId) {
            await this.selecionarOrganizacao(this.selectedOrg.internalId);
        }
    }

    async pesquisarUsuarios(term?: string): Promise<void> {
        if (!this.organizacao || typeof this.organizacao.buscarUsuarios !== 'function') return;
        try {
            this.searchedUsers = await lastValueFrom(this.organizacao.buscarUsuarios(term ?? this.userSearchTerm));
            this.cdr?.markForCheck();
        } catch {
            this.searchedUsers = [];
        }
    }

    selecionarUsuarioParaCompartilhar(user: OrganizacaoUsuarioBuscaDto): void {
        this.selectedShareUser = user;
        this.userSearchTerm = user.email || user.username || user.fullName || '';
    }

    toggleShareRole(code: string, checked: boolean): void {
        if (checked) {
            if (!this.shareSelectedRoles.includes(code)) {
                this.shareSelectedRoles = [...this.shareSelectedRoles, code];
            }
        } else {
            this.shareSelectedRoles = this.shareSelectedRoles.filter(r => r !== code);
        }
    }

    adicionarRoleInlineAoCompartilhamento(): void {
        const raw = (this.customInlineRole || '').trim();
        if (!raw) return;
        const preview = this.formatOrgRolePreview(raw);
        if (preview === 'ORG_...') {
            this.notificar('Informe um nome válido para o role após ORG.', true);
            return;
        }
        if (!this.shareSelectedRoles.includes(preview)) {
            this.shareSelectedRoles = [...this.shareSelectedRoles, preview];
        }
        this.customInlineRole = '';
    }

    async compartilharOrganizacao(): Promise<void> {
        if (!this.selectedOrg?.internalId || !this.organizacao) return;
        const emailOrUsername = (this.userSearchTerm || '').trim();
        const userId = this.selectedShareUser?.id;
        if (!userId && !emailOrUsername) {
            this.notificar('Selecione um usuário ou informe o e-mail/username para compartilhar.', true);
            return;
        }

        const roles = this.shareSelectedRoles.length > 0 ? [...this.shareSelectedRoles] : ['ORG_MEMBRO'];
        this.saving = true;
        this.cdr?.markForCheck();
        try {
            const member = await lastValueFrom(
                this.organizacao.compartilharComUsuario(this.selectedOrg.internalId, {
                    ...(userId ? { userId } : { emailOrUsername }),
                    roles,
                })
            );
            this.notificar(
                `Acesso compartilhado via Tenant com ${member.userName || member.userEmail || 'usuário'} (${(member.roles || []).join(', ')}).`
            );
            this.userSearchTerm = '';
            this.selectedShareUser = undefined;
            this.searchedUsers = [];
            await this.selecionarOrganizacao(this.selectedOrg.internalId);
        } catch (err: any) {
            this.notificar(err?.error?.message || 'Erro ao compartilhar organização via Tenant.', true);
        } finally {
            this.saving = false;
            this.cdr?.markForCheck();
        }
    }

    iniciarEdicaoRolesMembro(member: OrganizacaoMembroDto): void {
        this.editingMemberId = member.internalId;
        this.editingMemberRoles = [...(member.roles || [])];
    }

    cancelarEdicaoRolesMembro(): void {
        this.editingMemberId = undefined;
        this.editingMemberRoles = [];
    }

    toggleEditingMemberRole(code: string, checked: boolean): void {
        if (checked) {
            if (!this.editingMemberRoles.includes(code)) {
                this.editingMemberRoles = [...this.editingMemberRoles, code];
            }
        } else {
            this.editingMemberRoles = this.editingMemberRoles.filter(r => r !== code);
        }
    }

    async salvarRolesMembro(member: OrganizacaoMembroDto): Promise<void> {
        if (!this.selectedOrg?.internalId || !member.internalId || !this.organizacao) return;
        this.saving = true;
        this.cdr?.markForCheck();
        try {
            await lastValueFrom(
                this.organizacao.atribuirRolesMembro(
                    this.selectedOrg.internalId,
                    member.internalId,
                    this.editingMemberRoles
                )
            );
            this.editingMemberId = undefined;
            this.notificar(`Roles atualizados para ${member.userName || member.userEmail}.`);
            if (member.userId === this.currentUser?.id) {
                await this.atualizarPerfilSessao();
            }
            await this.selecionarOrganizacao(this.selectedOrg.internalId);
        } catch (err: any) {
            this.notificar(err?.error?.message || 'Erro ao atribuir roles ao membro.', true);
        } finally {
            this.saving = false;
            this.cdr?.markForCheck();
        }
    }

    async removerMembro(member: OrganizacaoMembroDto): Promise<void> {
        if (!this.selectedOrg?.internalId || !member.internalId || !this.organizacao) return;
        this.saving = true;
        this.cdr?.markForCheck();
        try {
            await lastValueFrom(
                this.organizacao.removerMembro(this.selectedOrg.internalId, member.internalId)
            );
            this.notificar(`Acesso de ${member.userName || member.userEmail} revogado.`);
            await this.selecionarOrganizacao(this.selectedOrg.internalId);
        } catch (err: any) {
            this.notificar(err?.error?.message || 'Erro ao remover membro.', true);
        } finally {
            this.saving = false;
            this.cdr?.markForCheck();
        }
    }

    async criarRoleOrganizacao(): Promise<void> {
        if (!this.selectedOrg?.internalId || !this.organizacao) return;
        const name = (this.newRoleForm.name || '').trim();
        if (!name || this.previewRoleCode === 'ORG_...') {
            this.notificar('Informe o nome personalizado do role (ex.: Financeiro).', true);
            return;
        }
        this.saving = true;
        this.cdr?.markForCheck();
        try {
            const role = await lastValueFrom(
                this.organizacao.criarRole(this.selectedOrg.internalId, {
                    name,
                    description: this.newRoleForm.description?.trim() || undefined,
                })
            );
            this.newRoleForm = { name: '', description: '' };
            this.notificar(`Role "${role.code}" criado com sucesso!`);
            await this.selecionarOrganizacao(this.selectedOrg.internalId);
        } catch (err: any) {
            this.notificar(err?.error?.message || 'Erro ao criar role personalizado.', true);
        } finally {
            this.saving = false;
            this.cdr?.markForCheck();
        }
    }

    async removerRoleOrganizacao(role: OrganizacaoRoleDto): Promise<void> {
        if (!this.selectedOrg?.internalId || !role.internalId || !this.organizacao) return;
        this.saving = true;
        this.cdr?.markForCheck();
        try {
            await lastValueFrom(
                this.organizacao.removerRole(this.selectedOrg.internalId, role.internalId)
            );
            this.notificar(`Role "${role.code}" removido.`);
            await this.selecionarOrganizacao(this.selectedOrg.internalId);
        } catch (err: any) {
            this.notificar(err?.error?.message || 'Erro ao remover role.', true);
        } finally {
            this.saving = false;
            this.cdr?.markForCheck();
        }
    }

    private async atualizarPerfilSessao(): Promise<void> {
        if (!this.authService || !this.userAuth) return;
        try {
            const profile = await lastValueFrom(this.authService.profile());
            if (profile?.id) {
                this.userAuth.atualizarPerfilConta(profile);
            }
        } catch { }
    }

    private notificar(msg: string, isError = false): void {
        this.snackBar?.open(msg, 'Fechar', {
            duration: isError ? 4500 : 3200,
        });
    }
}
