import { Component, Input, OnInit, OnDestroy, Optional } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

export interface IModuleItem {
  key: string;
  name: string;
  category: string;
  icon: string;
  shortDescription?: string;
  isStandard: boolean;
  selected?: boolean;
  customRules?: {
    alias?: string;
    icon?: string;
    order?: number;
    enabled?: boolean;
    initialRoute?: string;
    params?: Record<string, any>;
  };
}

export const STANDARD_MODULES: IModuleItem[] = [
  {
    key: 'CRM',
    name: 'CRM',
    category: 'Negócios',
    icon: 'crm',
    shortDescription: 'Gestão de relacionamento com clientes, funis e histórico de atendimentos.',
    isStandard: true
  },
  {
    key: 'Cadastros',
    name: 'Cadastros',
    category: 'Negócios',
    icon: 'cadastros',
    shortDescription: 'Registro e centralização de clientes, fornecedores, colaboradores e contatos.',
    isStandard: true
  },
  {
    key: 'Financeiro',
    name: 'Financeiro',
    category: 'Negócios',
    icon: 'financeiro',
    shortDescription: 'Contas a pagar e receber, fluxo de caixa, conciliação e faturamento.',
    isStandard: true
  },
  {
    key: 'Vendas',
    name: 'Vendas',
    category: 'Negócios',
    icon: 'vendas',
    shortDescription: 'Ciclo de vendas, propostas, pedidos e comissões.',
    isStandard: true
  },
  {
    key: 'Produtos',
    name: 'Produtos',
    category: 'Negócios',
    icon: 'produtos',
    shortDescription: 'Catálogo de produtos e serviços, variações, preços e controle de estoque.',
    isStandard: true
  },
  {
    key: 'Mensagens',
    name: 'Mensagens',
    category: 'Comunicação',
    icon: 'mensagens',
    shortDescription: 'Comunicação direta, chat corporativo, broadcast e notificações automáticas.',
    isStandard: true
  },
  {
    key: 'Organizacao',
    name: 'Organização',
    category: 'Produtividade',
    icon: 'organizacao',
    shortDescription: 'Agenda compartilhada, listas de tarefas, lembretes e anotações.',
    isStandard: true
  },
  {
    key: 'Projetos',
    name: 'Projetos',
    category: 'Produtividade',
    icon: 'projetos',
    shortDescription: 'Planejamento e acompanhamento ágil de iniciativas, tarefas e prazos.',
    isStandard: true
  },
  {
    key: 'Arquivos',
    name: 'Arquivos',
    category: 'Sistema',
    icon: 'files',
    shortDescription: 'Armazenamento seguro, upload em lote e organização de documentos.',
    isStandard: true
  },
  {
    key: 'Formularios',
    name: 'Formulários',
    category: 'Ferramentas',
    icon: 'formularios',
    shortDescription: 'Criação de formulários dinâmicos para coleta de dados e pesquisas.',
    isStandard: true
  },
  {
    key: 'CMS',
    name: 'CMS',
    category: 'Conteúdo',
    icon: 'cms',
    shortDescription: 'Gerenciador de páginas, artigos de blog e conteúdo digital institucional.',
    isStandard: true
  },
  {
    key: 'LowCode',
    name: 'LowCode',
    category: 'Desenvolvimento',
    icon: 'low-code',
    shortDescription: 'Construção visual de automações, fluxos e pequenas aplicações internas.',
    isStandard: true
  },
  {
    key: 'Dynamic',
    name: 'Dynamic XD',
    category: 'Design',
    icon: 'dynamic',
    shortDescription: 'Prototipação rápida e design visual de interfaces.',
    isStandard: true
  },
  {
    key: 'Treinamento',
    name: 'Treinamento',
    category: 'Educação',
    icon: 'treinamento',
    shortDescription: 'Universidade corporativa com trilhas de aprendizagem e materiais de apoio.',
    isStandard: true
  },
  {
    key: 'DevTools',
    name: 'DevTools',
    category: 'Desenvolvimento',
    icon: 'dev-tools',
    shortDescription: 'Diagnóstico técnico, monitoramento de performance e inspeção de APIs.',
    isStandard: true
  },
  {
    key: 'Codex',
    name: 'Codex',
    category: 'Desenvolvimento',
    icon: 'codex',
    shortDescription: 'IDE integrada com suporte a linguagens e manutenção rápida de código.',
    isStandard: true
  },
  {
    key: 'SEO',
    name: 'SEO',
    category: 'Marketing',
    icon: 'seo',
    shortDescription: 'Análise de visibilidade, palavras-chave e otimização para motores de busca.',
    isStandard: true
  },
  {
    key: 'Threejs',
    name: 'Threejs 3D',
    category: 'Design',
    icon: 'threejs',
    shortDescription: 'Visualização tridimensional de produtos e modelos interativos no browser.',
    isStandard: true
  },
  {
    key: 'Grupos',
    name: 'Grupos',
    category: 'Comunicação',
    icon: 'diversity_3',
    shortDescription: 'Comunidades corporativas e canais temáticos por departamento.',
    isStandard: true
  }
];

@Component({
  selector: 'ci-dyn-input-modules',
  standalone: false,
  templateUrl: './dyn-input-modules.component.html',
  styleUrls: ['./dyn-input-modules.component.scss']
})
export class DynInputModulesComponent implements OnInit, OnDestroy {
  @Input() fieldName?: string = 'modules';
  @Input() label?: string = 'Módulos da Aplicação';
  @Input() description?: string = 'Selecione e combine quais módulos padrão e customizados compõem esta aplicação.';
  @Input() formGroup?: FormGroup;
  @Input() formControl?: FormControl;

  // Lista de módulos disponíveis (padrões + customizados adicionados)
  allModules: IModuleItem[] = [];
  filteredModules: IModuleItem[] = [];

  // Módulos atualmente selecionados na aplicação (mantém a ordem de combinação)
  selectedModules: IModuleItem[] = [];

  // Filtros e busca
  searchTerm: string = '';
  selectedCategory: string = 'TODOS';
  categories: string[] = ['TODOS', 'Negócios', 'Produtividade', 'Comunicação', 'Conteúdo', 'Desenvolvimento', 'Sistema', 'Customizados'];

  // Input para adicionar módulo customizado/faltante
  newCustomModuleName: string = '';
  newCustomModuleDesc: string = '';

  // Configuração de regras do módulo selecionado para edição detalhada
  editingRulesModule: IModuleItem | null = null;
  ruleAlias: string = '';
  ruleInitialRoute: string = '';
  ruleParamsJson: string = '';

  // Regras globais da aplicação combinada
  appTheme: string = '';
  appDefaultModule: string = '';
  showGlobalRules: boolean = false;

  private controlSub?: Subscription;

  constructor() {}

  ngOnInit(): void {
    // Inicializa a lista com os módulos padrão clonados
    this.allModules = STANDARD_MODULES.map(m => ({ ...m, selected: false }));

    // Conecta com o FormControl
    const control = this.getControl();
    if (control) {
      this.syncFromControlValue(control.value);
      this.controlSub = control.valueChanges.subscribe(val => {
        // Apenas sincroniza se houver divergência externa
        const currentKeys = this.selectedModules.map(m => m.key);
        const incomingKeys = Array.isArray(val) ? val : (typeof val === 'string' && val.trim() ? val.split(',').map((s: string) => s.trim()) : []);
        if (JSON.stringify(currentKeys) !== JSON.stringify(incomingKeys)) {
          this.syncFromControlValue(val);
        }
      });
    }

    // Carrega regras globais existentes no formGroup se houver
    if (this.formGroup?.get('customRules')?.value) {
      const cr = this.formGroup.get('customRules')?.value;
      if (typeof cr === 'object') {
        this.appTheme = cr.theme || '';
        this.appDefaultModule = cr.defaultModule || '';
      }
    }

    this.applyFilters();
  }

  ngOnDestroy(): void {
    this.controlSub?.unsubscribe();
  }

  private getControl(): FormControl | null {
    if (this.formControl) return this.formControl;
    if (this.formGroup && this.fieldName) {
      const ctrl = this.formGroup.get(this.fieldName);
      if (ctrl instanceof FormControl) return ctrl;
    }
    return null;
  }

  private syncFromControlValue(val: any): void {
    let keys: string[] = [];
    if (Array.isArray(val)) {
      keys = val.map(v => typeof v === 'string' ? v : v?.key || v?.name || String(v));
    } else if (typeof val === 'string' && val.trim().length > 0) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          keys = parsed.map(v => typeof v === 'string' ? v : v?.key || v?.name || String(v));
        } else {
          keys = val.split(',').map(s => s.trim()).filter(Boolean);
        }
      } catch {
        keys = val.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    // Para cada chave selecionada, adiciona à lista se não existir nos padrões
    for (const key of keys) {
      const existing = this.allModules.find(m => m.key.toLowerCase() === key.toLowerCase() || m.name.toLowerCase() === key.toLowerCase());
      if (!existing) {
        // Módulo customizado ou ainda faltante (ex: Agendamento Estética, Ficha de Anamnese)
        const customItem: IModuleItem = {
          key,
          name: key,
          category: 'Customizados',
          icon: 'extension',
          shortDescription: 'Módulo customizado sem necessidade de código ou a ser implementado.',
          isStandard: false,
          selected: true
        };
        this.allModules.push(customItem);
      } else {
        existing.selected = true;
      }
    }

    // Atualiza estado de seleção dos padrões
    this.allModules.forEach(m => {
      m.selected = keys.some(k => k.toLowerCase() === m.key.toLowerCase() || k.toLowerCase() === m.name.toLowerCase());
    });

    // Reconstrói a lista ordenada de módulos selecionados respeitando a ordem informada
    const ordered: IModuleItem[] = [];
    for (const key of keys) {
      const found = this.allModules.find(m => m.key.toLowerCase() === key.toLowerCase() || m.name.toLowerCase() === key.toLowerCase());
      if (found && !ordered.includes(found)) {
        ordered.push(found);
      }
    }
    this.selectedModules = ordered;
    this.applyFilters();
  }

  applyFilters(): void {
    const term = (this.searchTerm || '').trim().toLowerCase();
    this.filteredModules = this.allModules.filter(m => {
      const matchesCategory =
        this.selectedCategory === 'TODOS' ||
        (this.selectedCategory === 'Customizados' && !m.isStandard) ||
        m.category.toLowerCase() === this.selectedCategory.toLowerCase();

      const matchesTerm =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.key.toLowerCase().includes(term) ||
        (m.shortDescription && m.shortDescription.toLowerCase().includes(term));

      return matchesCategory && matchesTerm;
    });
  }

  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.applyFilters();
  }

  toggleModule(mod: IModuleItem): void {
    mod.selected = !mod.selected;
    if (mod.selected) {
      if (!this.selectedModules.includes(mod)) {
        this.selectedModules.push(mod);
      }
    } else {
      this.selectedModules = this.selectedModules.filter(m => m.key !== mod.key);
      if (this.editingRulesModule?.key === mod.key) {
        this.editingRulesModule = null;
      }
    }
    this.emitChanges();
  }

  isModuleSelected(mod: IModuleItem): boolean {
    return Boolean(mod.selected);
  }

  addCustomModule(): void {
    const name = this.newCustomModuleName.trim();
    if (!name) return;

    const existing = this.allModules.find(m => m.key.toLowerCase() === name.toLowerCase() || m.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.selected = true;
      if (!this.selectedModules.includes(existing)) {
        this.selectedModules.push(existing);
      }
    } else {
      const customItem: IModuleItem = {
        key: name,
        name: name,
        category: 'Customizados',
        icon: 'extension',
        shortDescription: this.newCustomModuleDesc.trim() || 'Módulo customizado sem necessidade de código prévio.',
        isStandard: false,
        selected: true
      };
      this.allModules.push(customItem);
      this.selectedModules.push(customItem);
    }

    this.newCustomModuleName = '';
    this.newCustomModuleDesc = '';
    this.applyFilters();
    this.emitChanges();
  }

  removeModuleFromSelection(mod: IModuleItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    mod.selected = false;
    this.selectedModules = this.selectedModules.filter(m => m.key !== mod.key);
    if (!mod.isStandard) {
      // Remove da lista se for customizado e não mais selecionado
      this.allModules = this.allModules.filter(m => m.key !== mod.key);
    }
    if (this.editingRulesModule?.key === mod.key) {
      this.editingRulesModule = null;
    }
    this.applyFilters();
    this.emitChanges();
  }

  moveModule(index: number, direction: 'up' | 'down', event?: Event): void {
    if (event) event.stopPropagation();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= this.selectedModules.length) return;

    const item = this.selectedModules[index];
    this.selectedModules.splice(index, 1);
    this.selectedModules.splice(targetIndex, 0, item);
    this.emitChanges();
  }

  openModuleRules(mod: IModuleItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.editingRulesModule = mod;
    this.ruleAlias = mod.customRules?.alias || mod.name;
    this.ruleInitialRoute = mod.customRules?.initialRoute || '';
    this.ruleParamsJson = mod.customRules?.params ? JSON.stringify(mod.customRules.params, null, 2) : '';
  }

  saveModuleRules(): void {
    if (!this.editingRulesModule) return;

    let parsedParams: Record<string, any> | undefined = undefined;
    if (this.ruleParamsJson && this.ruleParamsJson.trim()) {
      try {
        parsedParams = JSON.parse(this.ruleParamsJson);
      } catch {
        // JSON inválido: ignora ou mantém vazio
      }
    }

    this.editingRulesModule.customRules = {
      alias: this.ruleAlias.trim() || this.editingRulesModule.name,
      initialRoute: this.ruleInitialRoute.trim(),
      params: parsedParams
    };

    this.editingRulesModule = null;
    this.emitChanges();
  }

  closeModuleRules(): void {
    this.editingRulesModule = null;
  }

  updateGlobalRules(): void {
    this.emitChanges();
  }

  private emitChanges(): void {
    const keys = this.selectedModules.map(m => m.key);
    const control = this.getControl();
    if (control) {
      control.setValue(keys);
      control.markAsDirty();
    }

    // Se houver regras customizadas nos módulos ou regras globais, sincroniza no formGroup
    if (this.formGroup) {
      const moduleRules: Record<string, any> = {};
      this.selectedModules.forEach((m, idx) => {
        moduleRules[m.key] = {
          order: idx,
          alias: m.customRules?.alias || m.name,
          isStandard: m.isStandard,
          ...(m.customRules?.initialRoute ? { initialRoute: m.customRules.initialRoute } : {}),
          ...(m.customRules?.params ? { params: m.customRules.params } : {})
        };
      });

      const combinedCustomRules: Record<string, any> = {
        ...(this.formGroup.get('customRules')?.value || {}),
        isCombinedApp: true,
        modules: keys,
        modulesConfig: moduleRules,
        ...(this.appTheme ? { theme: this.appTheme } : {}),
        ...(this.appDefaultModule ? { defaultModule: this.appDefaultModule } : {})
      };

      if (!this.formGroup.get('customRules')) {
        this.formGroup.addControl('customRules', new FormControl(combinedCustomRules));
      } else {
        this.formGroup.get('customRules')?.setValue(combinedCustomRules);
      }
    }
  }
}
