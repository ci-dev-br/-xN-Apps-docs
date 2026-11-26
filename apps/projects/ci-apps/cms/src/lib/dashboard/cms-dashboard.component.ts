import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

export interface CmsContentItem {
  id: string;
  title: string;
  slug: string;
  type: 'post' | 'page' | 'notice';
  category: string;
  author: string;
  publishDate: string;
  views: number;
  status: 'publicado' | 'rascunho' | 'revisao' | 'agendado';
  excerpt: string;
}

export interface CmsMediaItem {
  id: string;
  filename: string;
  url: string;
  size: string;
  type: 'image' | 'pdf' | 'video';
  uploadedAt: string;
}

@Component({
  selector: 'ci-cms-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule
  ],
  templateUrl: './cms-dashboard.component.html',
  styleUrls: ['./cms-dashboard.component.scss']
})
export class CmsDashboardComponent implements OnInit {
  selectedFilter: 'todos' | 'post' | 'page' | 'notice' = 'todos';
  searchQuery = '';

  contents: CmsContentItem[] = [
    {
      id: 'cms-1',
      title: 'Lançamento da Plataforma Cloud 3.0 e Arquitetura Multi-Tenant',
      slug: 'lancamento-plataforma-cloud-3-0',
      type: 'post',
      category: 'Tecnologia',
      author: 'Equipe de Engenharia',
      publishDate: '19/10/2026',
      views: 3420,
      status: 'publicado',
      excerpt: 'Conheça todos os novos recursos de segurança, isolamento por tenant e performance.'
    },
    {
      id: 'cms-2',
      title: 'Política de Privacidade e Termos de Uso Corporativo',
      slug: 'politica-privacidade-termos-uso',
      type: 'page',
      category: 'Institucional',
      author: 'Jurídico & Compliance',
      publishDate: '15/10/2026',
      views: 1280,
      status: 'publicado',
      excerpt: 'Documentação oficial e transparente sobre conformidade LGPD e diretrizes de dados.'
    },
    {
      id: 'cms-3',
      title: 'Guia Prático: Como Integrar APIs Financeiras e Cobranças Pix',
      slug: 'guia-pratico-integracao-apis-pix',
      type: 'post',
      category: 'Financeiro',
      author: 'Juliana Costa',
      publishDate: '21/10/2026',
      views: 0,
      status: 'agendado',
      excerpt: 'Passo a passo completo com exemplos de requisição e webhooks seguros.'
    },
    {
      id: 'cms-4',
      title: 'Sobre a Empresa e Missão Organizacional',
      slug: 'sobre-nos',
      type: 'page',
      category: 'Institucional',
      author: 'Marketing Institucional',
      publishDate: '01/10/2026',
      views: 5890,
      status: 'publicado',
      excerpt: 'Nossa história, princípios e time multidisciplinar construindo o futuro.'
    },
    {
      id: 'cms-5',
      title: 'Comunicado Interno: Atualização de Manutenção Programada',
      slug: 'comunicado-manutencao-outubro',
      type: 'notice',
      category: 'Infraestrutura',
      author: 'DevOps Team',
      publishDate: '20/10/2026',
      views: 450,
      status: 'publicado',
      excerpt: 'Janela de manutenção preventiva no cluster de banco de dados neste domingo.'
    },
    {
      id: 'cms-6',
      title: 'Estudo de Caso: Modernização dos Portais Educacionais',
      slug: 'estudo-caso-portais-educacionais',
      type: 'post',
      category: 'Educação',
      author: 'Lucas Prado',
      publishDate: 'Em elaboração',
      views: 0,
      status: 'rascunho',
      excerpt: 'Resultados obtidos com o novo LMS corporativo e engajamento dos colaboradores.'
    }
  ];

  recentMedia: CmsMediaItem[] = [
    { id: 'm-1', filename: 'banner-portal-v3.png', url: 'assets/banner-portal-v3.png', size: '1.2 MB', type: 'image', uploadedAt: '19/10/2026' },
    { id: 'm-2', filename: 'manual-integracao-api.pdf', url: 'docs/manual-integracao-api.pdf', size: '3.4 MB', type: 'pdf', uploadedAt: '18/10/2026' },
    { id: 'm-3', filename: 'logo-brand-dark.svg', url: 'assets/logo-brand-dark.svg', size: '45 KB', type: 'image', uploadedAt: '17/10/2026' },
    { id: 'm-4', filename: 'apresentacao-institucional.pdf', url: 'docs/apresentacao-institucional.pdf', size: '5.1 MB', type: 'pdf', uploadedAt: '12/10/2026' }
  ];

  // Modal Novo Conteúdo
  showNewContentModal = false;
  newContent: Partial<CmsContentItem> = {
    title: '',
    slug: '',
    type: 'post',
    category: 'Geral',
    author: 'Editor Portal',
    status: 'publicado',
    excerpt: ''
  };

  ngOnInit(): void {}

  get filteredContents(): CmsContentItem[] {
    return this.contents.filter(item => {
      const matchType = this.selectedFilter === 'todos' || item.type === this.selectedFilter;
      const matchQuery = !this.searchQuery ||
        item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.slug.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchType && matchQuery;
    });
  }

  get totalPages(): number {
    return this.contents.filter(c => c.type === 'page').length;
  }

  get totalPosts(): number {
    return this.contents.filter(c => c.type === 'post').length;
  }

  get totalViews(): number {
    return this.contents.reduce((sum, c) => sum + c.views, 0);
  }

  openNewModal(): void {
    this.newContent = {
      title: '',
      slug: '',
      type: 'post',
      category: 'Geral',
      author: 'Editor Portal',
      status: 'publicado',
      excerpt: ''
    };
    this.showNewContentModal = true;
  }

  generateSlug(): void {
    if (this.newContent.title) {
      this.newContent.slug = this.newContent.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }

  saveContent(): void {
    if (!this.newContent.title) return;
    this.generateSlug();

    const item: CmsContentItem = {
      id: `cms-${Date.now()}`,
      title: this.newContent.title,
      slug: this.newContent.slug || 'artigo-sem-titulo',
      type: this.newContent.type || 'post',
      category: this.newContent.category || 'Geral',
      author: this.newContent.author || 'Editor Portal',
      publishDate: new Date().toLocaleDateString('pt-BR'),
      views: 0,
      status: this.newContent.status || 'publicado',
      excerpt: this.newContent.excerpt || ''
    };

    this.contents.unshift(item);
    this.showNewContentModal = false;
  }

  deleteContent(id: string): void {
    this.contents = this.contents.filter(c => c.id !== id);
  }

  togglePublish(item: CmsContentItem): void {
    item.status = item.status === 'publicado' ? 'rascunho' : 'publicado';
  }
}
