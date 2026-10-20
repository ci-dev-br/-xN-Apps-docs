import { Type } from '@angular/core';
import { ImplCard } from './card';
import { AppQuickCardComponent } from './app-quick-card.component';

/**
 * Mapeamento e enriquecimento de metadados para cards conhecidos da plataforma
 */
const KNOWN_CARD_METADATA: Record<string, {
    title?: string;
    descricao?: string;
    icon: string;
    category: string;
    tags?: string[];
    cols?: number;
}> = {
    // Financeiro
    MacroIndicatorsCard: {
        title: 'Panorama Econômico (BCB)',
        descricao: 'Acompanhe Selic, CDI, IPCA, IGP-M, Dólar e Euro com dados oficiais do Banco Central.',
        icon: 'trending_up',
        category: 'Financeiro',
        tags: ['Economia', 'Mercado', 'BCB', 'Câmbio'],
        cols: 2,
    },
    RecentQuotesCard: {
        title: 'Cotações Recentes B3',
        descricao: 'Últimos pregões e variação diária de ações negociadas na B3 (ex: PETR4, VALE3).',
        icon: 'show_chart',
        category: 'Financeiro',
        tags: ['Ações', 'B3', 'Mercado', 'Renda Variável'],
        cols: 2,
    },
    FundamentalIndicatorsCard: {
        title: 'Análise Fundamentalista',
        descricao: 'Métricas P/L, P/VP, LPA e VPA com base em balanços corporativos da B3.',
        icon: 'query_stats',
        category: 'Financeiro',
        tags: ['Valuation', 'Múltiplos', 'B3', 'Balanço'],
        cols: 2,
    },
    FinancialHealthCard: {
        title: 'Saúde Financeira e DRE',
        descricao: 'Demonstrativo de resultado, EBITDA, patrimônio líquido e endividamento via CVM.',
        icon: 'account_balance_wallet',
        category: 'Financeiro',
        tags: ['CVM', 'DRE', 'Balanço', 'Corporativo'],
        cols: 2,
    },

    // CRM
    AvailableForInstantPayoutComponent: {
        title: 'Saldo para Payout Instantâneo',
        descricao: 'Resumo de valores disponíveis para resgate e pagamentos imediatos.',
        icon: 'payments',
        category: 'CRM',
        tags: ['CRM', 'Receita', 'Financeiro'],
        cols: 1,
    },
    CalendarComponent: {
        title: 'Calendário de Compromissos',
        descricao: 'Visualização interativa da agenda, eventos e reuniões programadas.',
        icon: 'event',
        category: 'CRM',
        tags: ['CRM', 'Agenda', 'Compromissos', 'Tempo'],
        cols: 2,
    },
    ChessComponent: {
        title: 'Tabuleiro de Xadrez',
        descricao: 'Partidas e exercícios de xadrez para descompressão e raciocínio estratégico.',
        icon: 'sports_esports',
        category: 'CRM',
        tags: ['CRM', 'Jogos', 'Xadrez', 'Estratégia'],
        cols: 1,
    },
    CustomerByCountryComponent: {
        title: 'Clientes por País',
        descricao: 'Distribuição geográfica de clientes e receita por território global.',
        icon: 'public',
        category: 'CRM',
        tags: ['CRM', 'Clientes', 'Global', 'Território'],
        cols: 2,
    },
    DamasComponent: {
        title: 'Jogo de Damas',
        descricao: 'Tabuleiro clássico de damas para pausas operacionais rápidas.',
        icon: 'casino',
        category: 'CRM',
        tags: ['CRM', 'Jogos', 'Damas'],
        cols: 1,
    },
    IFrameComponent: {
        title: 'Visualizador Web Incorporado (IFrame)',
        descricao: 'Incorpore dashboards externos, BI ou páginas de suporte diretamente no seu painel.',
        icon: 'web',
        category: 'CRM',
        tags: ['CRM', 'Web', 'IFrame', 'Embed'],
        cols: 2,
    },
    ListComponent: {
        title: 'Lista de Atividades',
        descricao: 'Acompanhamento de tarefas e itens pendentes de execução.',
        icon: 'format_list_bulleted',
        category: 'CRM',
        tags: ['CRM', 'Tarefas', 'Listas', 'Produtividade'],
        cols: 2,
    },
    StatisticsComponent: {
        title: 'Estatísticas Gerais',
        descricao: 'Painel analítico com taxas de conversão e métricas de desempenho comercial.',
        icon: 'analytics',
        category: 'CRM',
        tags: ['CRM', 'Estatísticas', 'Conversões', 'KPIs'],
        cols: 2,
    },
    TotalComponent: {
        title: 'Totalizador Rápido',
        descricao: 'Indicador em destaque com métricas consolidadas.',
        icon: 'calculate',
        category: 'CRM',
        tags: ['CRM', 'Métricas', 'Total'],
        cols: 1,
    },
    TotalizadorComponent: {
        title: 'Painel Totalizador Gráfico',
        descricao: 'Gráfico e resumo total de vendas, atendimentos ou ordens de serviço.',
        icon: 'pie_chart',
        category: 'CRM',
        tags: ['CRM', 'Resumo', 'Gráfico', 'Vendas'],
        cols: 2,
    },

    // Comunicação & Sistema
    CardAIOChatComponent: {
        title: 'Audio IO Chat Local',
        descricao: 'Troca de mensagens em tempo real no mesmo ambiente de rede com suporte offline.',
        icon: 'chat',
        category: 'Comunicação',
        tags: ['AIO', 'Chat', 'Mensagens', 'Offline'],
        cols: 1,
    },
    TerminalCard: {
        title: 'Terminal Interativo CLI',
        descricao: 'Console baseado em xterm.js permitindo comandos e controle direto de tarefas.',
        icon: 'terminal',
        category: 'Utilitários',
        tags: ['Terminal', 'CLI', 'Console', 'Sistema'],
        cols: 2,
    },
    CardTerminalComponent: {
        title: 'Terminal Interativo CLI',
        descricao: 'Console baseado em xterm.js permitindo comandos e controle direto de tarefas.',
        icon: 'terminal',
        category: 'Utilitários',
        tags: ['Terminal', 'CLI', 'Console', 'Sistema'],
        cols: 2,
    },

    // Notícias & Feed
    RSSCard: {
        title: 'Leitor de Feed RSS',
        descricao: 'Acompanhe notícias e artigos de qualquer portal via XML/RSS em tempo real.',
        icon: 'rss_feed',
        category: 'Conteúdo',
        tags: ['Blogs', 'RSS', 'Notícias', 'Feed'],
        cols: 2,
    },
};

/**
 * Organiza e enriquece metadados de um card existente para exibição consistente
 */
export function organizeCardMetadata(card: ImplCard): ImplCard {
    const key = card.componentName || '';
    const known = KNOWN_CARD_METADATA[key];

    const category = card.category || known?.category || (
        (card.tags || []).some(t => /crm|vendas|clientes/i.test(t)) ? 'CRM' :
        (card.tags || []).some(t => /finan|econ|b3|bcb/i.test(t)) ? 'Financeiro' :
        (card.tags || []).some(t => /chat|msg|audio/i.test(t)) ? 'Comunicação' :
        (card.tags || []).some(t => /terminal|cli|sistema/i.test(t)) ? 'Utilitários' :
        (card.tags || []).some(t => /rss|blog|notic/i.test(t)) ? 'Conteúdo' : 'Geral'
    );

    const icon = card.icon || known?.icon || (
        category === 'Financeiro' ? 'trending_up' :
        category === 'CRM' ? 'dashboard' :
        category === 'Comunicação' ? 'chat' :
        category === 'Utilitários' ? 'terminal' :
        category === 'Conteúdo' ? 'newspaper' : 'widgets'
    );

    return {
        ...card,
        title: card.title || known?.title || key,
        descricao: card.descricao || known?.descricao || 'Card de informações do painel.',
        category,
        icon,
        tags: card.tags && card.tags.length > 0 ? card.tags : (known?.tags || [category]),
        dimensions: card.dimensions || { cols: known?.cols || 2, rows: 1 },
    };
}

/**
 * Cria a definição de um card dinâmico de atalho e resumo para qualquer aplicação integrada
 */
export function createGenericAppCard(app: any): ImplCard {
    const appKey = app.name || app.url?.replace(/^\//, '') || 'App';
    const componentName = `AppQuickCard_${appKey}`;

    return {
        componentName,
        componentVersion: '1.0.0',
        componentRef: AppQuickCardComponent,
        title: app.name || appKey,
        descricao: app.shortDescription || app.description || 'Atalho operacional e métricas do aplicativo.',
        icon: app.icon || 'apps',
        category: app.categoria || 'Aplicativos',
        tags: [app.categoria || 'Geral', 'Produtividade'],
        dimensions: { cols: 1, rows: 1 },
        defaultInputs: {
            appName: app.name || appKey,
            appUrl: app.url,
            appIcon: app.icon || 'apps',
            appColor: app.color || '#3f51b5',
            appCategory: app.categoria || 'Aplicativo',
            appDescription: app.shortDescription || app.description || ''
        },
        settings: {}
    };
}
