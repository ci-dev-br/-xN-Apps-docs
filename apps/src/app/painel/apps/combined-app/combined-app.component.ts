import { Component, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CI_STATIC_APPS, IApp } from '../apps';
import { ApplicationService } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';

export interface ICombinedModuleView {
  key: string;
  name: string;
  icon: string;
  isStandard: boolean;
  routePath?: string;
  description?: string;
  customRules?: Record<string, any>;
}

@Component({
  selector: 'ci-combined-app',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './combined-app.component.html',
  styleUrls: ['./combined-app.component.scss']
})
export class CombinedAppComponent implements OnInit {
  appKey: string = 'BeautyCRM';
  app?: IApp;

  // Lista dos módulos combinados
  combinedModules: ICombinedModuleView[] = [];
  activeModuleIndex: number = 0;
  activeModule?: ICombinedModuleView;

  // Regras customizadas da aplicação
  customRules?: Record<string, any>;
  themeClass: string = 'default-theme';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    @Optional() private readonly appService?: ApplicationService
  ) {}

  async ngOnInit(): Promise<void> {
    const paramKey = this.route.snapshot.paramMap.get('appKey');
    const url = this.router.url;

    if (paramKey) {
      this.appKey = paramKey;
    } else if (url.includes('BeautyCRM') || url.includes('beauty')) {
      this.appKey = 'Beauty CRM';
    }

    await this.loadApp();
  }

  private async loadApp(): Promise<void> {
    // 1. Procura na lista local de aplicações
    let found = CI_STATIC_APPS.find(a =>
      a.name?.toLowerCase() === this.appKey.toLowerCase() ||
      a.url?.replace(/^\//, '').toLowerCase() === this.appKey.toLowerCase()
    );

    // 2. Se não encontrar e tiver appService, busca no backend
    if (!found && this.appService) {
      try {
        const list = await lastValueFrom(this.appService.getList({ body: {} }));
        if (Array.isArray(list)) {
          found = list.find((a: any) =>
            a.name?.toLowerCase() === this.appKey.toLowerCase() ||
            a.url?.replace(/^\//, '').toLowerCase() === this.appKey.toLowerCase() ||
            a.appKey?.toLowerCase() === this.appKey.toLowerCase()
          );
        }
      } catch {
        // fallback
      }
    }

    // Se ainda não encontrar, cria o perfil padrão para Beauty CRM
    if (!found) {
      found = {
        name: 'Beauty CRM',
        shortDescription: 'CRM especializado em beleza e estética combinando múltiplos módulos padrão e regras customizadas.',
        description: 'Aplicação composta montada a partir da combinação de módulos padrão (Cadastros, CRM, Financeiro, Vendas, Mensagens) e módulos estéticos complementares sem necessidade de código.',
        url: '/BeautyCRM',
        categoria: 'Business',
        color: '#E91E63',
        icon: 'crm',
        modules: ['Cadastros', 'CRM', 'Financeiro', 'Vendas', 'Mensagens', 'Agendamento Estética', 'Ficha de Anamnese'],
        customRules: {
          theme: 'beauty',
          vertical: 'beauty',
          defaultModule: 'CRM',
          commissionRate: 0.15
        }
      };
    }

    this.app = found;
    this.customRules = found.customRules || {};

    if (this.customRules?.['theme'] === 'beauty' || this.app.name?.includes('Beauty')) {
      this.themeClass = 'beauty-theme';
    }

    this.buildCombinedModules(found);
  }

  private buildCombinedModules(app: IApp): void {
    const rawModules = app.modules || ['Cadastros', 'CRM', 'Financeiro', 'Vendas', 'Mensagens'];
    const modulesConfig = this.customRules?.['modulesConfig'] || {};

    this.combinedModules = rawModules.map(modKey => {
      // Verifica se é uma aplicação padrão
      const standardFound = CI_STATIC_APPS.find(s =>
        s.name?.toLowerCase() === modKey.toLowerCase() ||
        s.url?.replace(/^\//, '').toLowerCase() === modKey.toLowerCase()
      );

      const modRules = modulesConfig[modKey] || {};
      const displayName = modRules.alias || (standardFound ? standardFound.name : modKey);

      return {
        key: modKey,
        name: displayName || modKey,
        icon: standardFound?.icon || (modKey.toLowerCase().includes('agend') ? 'event' : modKey.toLowerCase().includes('ficha') ? 'assignment' : 'widgets'),
        isStandard: !!standardFound,
        routePath: standardFound?.url || `/painel/${modKey}`,
        description: standardFound?.shortDescription || `Módulo customizado "${modKey}" integrado à aplicação com regras configuradas sem código.`,
        customRules: modRules
      };
    });

    // Define módulo inicial
    const defModule = this.customRules?.['defaultModule'];
    let initialIdx = 0;
    if (defModule) {
      const idx = this.combinedModules.findIndex(m => m.key.toLowerCase() === defModule.toLowerCase() || m.name.toLowerCase() === defModule.toLowerCase());
      if (idx > -1) initialIdx = idx;
    }

    this.selectModule(initialIdx);
  }

  selectModule(index: number): void {
    if (index >= 0 && index < this.combinedModules.length) {
      this.activeModuleIndex = index;
      this.activeModule = this.combinedModules[index];
    }
  }

  navigateToStandardModule(mod: ICombinedModuleView): void {
    if (mod.routePath) {
      this.router.navigate([mod.routePath]);
    }
  }

  voltarParaPainel(): void {
    this.router.navigate(['/painel/meus-apps']);
  }
}
