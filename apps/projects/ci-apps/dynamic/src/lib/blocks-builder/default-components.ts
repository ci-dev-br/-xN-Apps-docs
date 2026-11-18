import {
    AppQuickCardComponent,
    BoardComponent,
    DataDetailViewComponent,
    DataListComponent,
    FileComponent,
    FooterComponent,
    IconComponent,
    InputComponent,
    LNavComponent,
    LogoComponent,
    NavbarComponent,
    PesquisarComponent,
    StatusBarComponent,
} from '@ci/components';
import { ActionComponent } from '@ci/components/action';
import { AIOChatComponent } from '@ci/components/aio';
import { CalendarComponent } from '@ci/components/calendar';
import { CardboardComponent } from '@ci/components/cardboard';
import { DataGridComponent } from '@ci/components/data-grid';
import { DynFormComponent, DynInputComponent } from '@ci/components/dyn-form';
import { EditarDetailComponent } from '@ci/components/editar-detail';
import { KeyboardComponent } from '@ci/components/keyboard';
import { MasterDetailComponent } from '@ci/components/master-detail';
import { SettingsComponent } from '@ci/components/settings';
import { TerminalComponent } from '@ci/components/terminal';
import { WindowComponent } from '@ci/components/window';
import { DynamicComponentDefinition } from './blocks-builder.models';

/**
 * Catálogo padrão de componentes disponíveis para construção de telas em blocos no Dynamic,
 * incluindo blocos base do Dynamic e os componentes implementados em `@ci/components`.
 */
export const DYNAMIC_DEFAULT_COMPONENTS: DynamicComponentDefinition[] = [
    // =========================================================================
    // Blocos Base do Dynamic
    // =========================================================================
    {
        name: 'container',
        title: 'Container / Seção',
        description: 'Agrupa outros blocos em linha ou coluna com espaçamento configurável.',
        icon: 'view_agenda',
        category: 'Layout',
        allowChildren: true,
        inputs: [
            { name: 'direction', label: 'Direção', type: 'select', defaultValue: 'column', options: [
                { label: 'Coluna (Vertical)', value: 'column' },
                { label: 'Linha (Horizontal)', value: 'row' },
            ]},
            { name: 'gap', label: 'Espaçamento (px)', type: 'number', defaultValue: 12 },
            { name: 'padding', label: 'Padding (px)', type: 'number', defaultValue: 16 },
            { name: 'background', label: 'Cor de Fundo', type: 'color', defaultValue: '#ffffff' },
        ],
    },
    {
        name: 'heading',
        title: 'Título / Texto',
        description: 'Exibe título ou parágrafo informativo na tela.',
        icon: 'title',
        category: 'Conteúdo',
        inputs: [
            { name: 'text', label: 'Texto', type: 'textarea', defaultValue: 'Título da Seção', required: true },
            { name: 'level', label: 'Nível', type: 'select', defaultValue: 'h2', options: [
                { label: 'Título H1', value: 'h1' },
                { label: 'Título H2', value: 'h2' },
                { label: 'Título H3', value: 'h3' },
                { label: 'Parágrafo', value: 'p' },
            ]},
            { name: 'color', label: 'Cor do Texto', type: 'color', defaultValue: '#1f2937' },
        ],
    },
    {
        name: 'button',
        title: 'Button',
        description: 'Capture o clique do usuário com um botão para determinada ação do layout.',
        icon: 'smart_button',
        category: 'Ações',
        inputs: [
            { name: 'label', label: 'Rótulo', type: 'string', defaultValue: 'Executar Ação', required: true },
            { name: 'variant', label: 'Estilo', type: 'select', defaultValue: 'raised', options: [
                { label: 'Elevado (Raised)', value: 'raised' },
                { label: 'Preenchido (Flat)', value: 'flat' },
                { label: 'Contorno (Stroked)', value: 'stroked' },
                { label: 'Texto (Basic)', value: 'basic' },
            ]},
            { name: 'color', label: 'Cor', type: 'select', defaultValue: 'primary', options: [
                { label: 'Primária', value: 'primary' },
                { label: 'Destaque (Accent)', value: 'accent' },
                { label: 'Alerta (Warn)', value: 'warn' },
            ]},
            { name: 'disabled', label: 'Desabilitado', type: 'boolean', defaultValue: false },
            { name: 'actionRoute', label: 'Rota de Destino', type: 'string', defaultValue: '' },
        ],
    },
    {
        name: 'alert',
        title: 'Alert',
        description: 'Notifique o usuário com uma mensagem direcionada em forma de alerta.',
        icon: 'info',
        category: 'Feedback',
        inputs: [
            { name: 'title', label: 'Título', type: 'string', defaultValue: 'Aviso importante' },
            { name: 'message', label: 'Mensagem', type: 'textarea', defaultValue: 'Conteúdo da notificação ao usuário.', required: true },
            { name: 'severity', label: 'Severidade', type: 'select', defaultValue: 'info', options: [
                { label: 'Informação', value: 'info' },
                { label: 'Sucesso', value: 'success' },
                { label: 'Atenção', value: 'warning' },
                { label: 'Erro', value: 'error' },
            ]},
            { name: 'dismissible', label: 'Permite Fechar', type: 'boolean', defaultValue: true },
        ],
    },
    {
        name: 'snackbar',
        title: 'Snackbar',
        description: 'Notifique o usuário de forma sutil, permitindo reação opcional.',
        icon: 'announcement',
        category: 'Feedback',
        inputs: [
            { name: 'message', label: 'Mensagem', type: 'string', defaultValue: 'Operação concluída com sucesso.', required: true },
            { name: 'actionLabel', label: 'Texto da Ação', type: 'string', defaultValue: 'OK' },
            { name: 'durationMs', label: 'Duração (ms)', type: 'number', defaultValue: 3000 },
        ],
    },
    {
        name: 'form',
        title: 'Form',
        description: 'Capture e demonstre conjunto de informações segmentadas por campos.',
        icon: 'dynamic_form',
        category: 'Dados',
        inputs: [
            { name: 'schemaName', label: 'Schema da Entidade', type: 'string', defaultValue: '' },
            { name: 'submitLabel', label: 'Texto do Botão Enviar', type: 'string', defaultValue: 'Salvar' },
            { name: 'fields', label: 'Campos (JSON)', type: 'json', defaultValue: [
                { name: 'nome', label: 'Nome', type: 'text', required: true },
                { name: 'email', label: 'E-mail', type: 'email', required: false },
            ]},
            { name: 'deepCollect', label: 'Coleta Profunda de Eventos', type: 'boolean', defaultValue: true },
        ],
    },
    {
        name: 'dialog',
        title: 'Dialog',
        description: 'Visualize um componente em forma de janela flutuante por cima da aplicação.',
        icon: 'open_in_new',
        category: 'Layout',
        allowChildren: true,
        inputs: [
            { name: 'title', label: 'Título da Janela', type: 'string', defaultValue: 'Detalhes' },
            { name: 'width', label: 'Largura', type: 'string', defaultValue: '520px' },
            { name: 'showClose', label: 'Exibir Botão Fechar', type: 'boolean', defaultValue: true },
        ],
    },
    {
        name: 'pivot-list',
        title: 'Pivot List',
        description: 'Mostra um conjunto de dados em forma de lista.',
        icon: 'view_list',
        category: 'Dados',
        inputs: [
            { name: 'schemaName', label: 'Schema da Entidade', type: 'string', defaultValue: '' },
            { name: 'titleField', label: 'Campo Título', type: 'string', defaultValue: 'name' },
            { name: 'subtitleField', label: 'Campo Subtítulo', type: 'string', defaultValue: 'description' },
            { name: 'items', label: 'Itens de Exemplo (JSON)', type: 'json', defaultValue: [
                { name: 'Item 1', description: 'Descrição do item 1' },
                { name: 'Item 2', description: 'Descrição do item 2' },
            ]},
        ],
    },
    {
        name: 'pivot-table',
        title: 'Pivot Table',
        description: 'Mostra um conjunto de dados em forma de tabela.',
        icon: 'table_chart',
        category: 'Dados',
        inputs: [
            { name: 'schemaName', label: 'Schema da Entidade', type: 'string', defaultValue: '' },
            { name: 'columns', label: 'Colunas (JSON)', type: 'json', defaultValue: ['id', 'name', 'status'] },
            { name: 'pageSize', label: 'Itens por Página', type: 'number', defaultValue: 10 },
            { name: 'sortable', label: 'Permitir Ordenação', type: 'boolean', defaultValue: true },
        ],
    },

    // =========================================================================
    // Componentes de @ci/components (apps/projects/ci/components/src/lib)
    // =========================================================================
    {
        name: 'ci-master-detail',
        title: 'Master Detail (CRUD)',
        description: 'Listagem e CRUD completo orientado a schema (@ci/components/master-detail).',
        icon: 'dataset',
        category: '@ci/components',
        componentRef: MasterDetailComponent,
        inputs: [
            { name: 'schemaName', label: 'Schema da Entidade', type: 'string', defaultValue: '', required: true },
            { name: 'visualizacao', label: 'Visualização', type: 'select', defaultValue: 'table', options: [
                { label: 'Tabela', value: 'table' },
                { label: 'Lista', value: 'list' },
                { label: 'Miniaturas', value: 'thumbnails' },
            ]},
            { name: 'gridOptions', label: 'Opções da Grade (JSON)', type: 'json', defaultValue: { columns: [] } },
        ],
    },
    {
        name: 'ci-editar-detail',
        title: 'Editar Detail',
        description: 'Formulário de edição automática de entidade por schema (@ci/components/editar-detail).',
        icon: 'edit_note',
        category: '@ci/components',
        componentRef: EditarDetailComponent,
        inputs: [
            { name: 'schemaName', label: 'Schema da Entidade', type: 'string', defaultValue: '', required: true },
        ],
    },
    {
        name: 'ci-data-grid',
        title: 'Data Grid',
        description: 'Grade de dados com filtros por coluna e seleção (@ci/components/data-grid).',
        icon: 'grid_on',
        category: '@ci/components',
        componentRef: DataGridComponent,
        inputs: [
            { name: 'enableColumnFilters', label: 'Filtros por Coluna', type: 'boolean', defaultValue: false },
            { name: 'selectionMode', label: 'Modo de Seleção', type: 'select', defaultValue: 'row', options: [
                { label: 'Linha', value: 'row' },
                { label: 'Múltiplas Linhas', value: 'multi-row' },
                { label: 'Célula', value: 'cell' },
                { label: 'Múltiplas Células', value: 'multi-cell' },
                { label: 'Múltiplo', value: 'multi' },
            ]},
            { name: 'filters', label: 'Filtros (JSON)', type: 'json', defaultValue: {} },
            { name: 'source', label: 'Dados (JSON)', type: 'json', defaultValue: [] },
        ],
    },
    {
        name: 'ci-data-list',
        title: 'Data List',
        description: 'Lista dinâmica de itens com seleção (@ci/components).',
        icon: 'list_alt',
        category: '@ci/components',
        componentRef: DataListComponent,
        inputs: [
            { name: 'source', label: 'Itens (JSON)', type: 'json', defaultValue: [] },
            { name: 'options', label: 'Opções da Lista (JSON)', type: 'json', defaultValue: {} },
        ],
    },
    {
        name: 'ci-data-detail-view',
        title: 'Data Detail View',
        description: 'Visualização detalhada de registro por schema (@ci/components).',
        icon: 'pageview',
        category: '@ci/components',
        componentRef: DataDetailViewComponent,
        inputs: [
            { name: 'schemaName', label: 'Schema da Entidade', type: 'string', defaultValue: '' },
        ],
    },
    {
        name: 'ci-dyn-form',
        title: 'Dyn Form',
        description: 'Formulário dinâmico baseado em schema (@ci/components/dyn-form).',
        icon: 'assignment',
        category: '@ci/components',
        componentRef: DynFormComponent,
        inputs: [
            { name: 'schemaName', label: 'Schema da Entidade', type: 'string', defaultValue: '' },
        ],
    },
    {
        name: 'ci-dyn-input',
        title: 'Dyn Input',
        description: 'Campo de entrada dinâmico (@ci/components/dyn-form).',
        icon: 'input',
        category: '@ci/components',
        componentRef: DynInputComponent,
        inputs: [
            { name: 'label', label: 'Rótulo', type: 'string', defaultValue: 'Campo' },
            { name: 'placeholder', label: 'Placeholder', type: 'string', defaultValue: '' },
            { name: 'hint', label: 'Dica (Hint)', type: 'string', defaultValue: '' },
            { name: 'description', label: 'Descrição', type: 'string', defaultValue: '' },
            { name: 'format', label: 'Formato', type: 'string', defaultValue: '' },
            { name: 'isArray', label: 'Múltiplos Valores (Array)', type: 'boolean', defaultValue: false },
            { name: 'enumOptions', label: 'Opções Enum (JSON)', type: 'json', defaultValue: [] },
        ],
    },
    {
        name: 'ci-input',
        title: 'CI Input / Texto Editável',
        description: 'Campo de entrada ou conteúdo editável inline (@ci/components).',
        icon: 'text_fields',
        category: '@ci/components',
        componentRef: InputComponent,
        inputs: [
            { name: 'mode', label: 'Modo', type: 'select', defaultValue: 'input', options: [
                { label: 'Input', value: 'input' },
                { label: 'Conteúdo Editável', value: 'content-editable' },
            ]},
            { name: 'stage', label: 'Estágio', type: 'select', defaultValue: 'view', options: [
                { label: 'Visualização', value: 'view' },
                { label: 'Edição', value: 'edit' },
            ]},
            { name: 'fieldName', label: 'Nome do Campo', type: 'string', defaultValue: '' },
            { name: 'label', label: 'Rótulo', type: 'string', defaultValue: 'Campo' },
            { name: 'placeholder', label: 'Placeholder', type: 'string', defaultValue: '' },
            { name: 'el', label: 'Elemento HTML', type: 'select', defaultValue: 'p', options: [
                { label: 'Parágrafo (p)', value: 'p' },
                { label: 'H1', value: 'h1' },
                { label: 'H2', value: 'h2' },
                { label: 'H3', value: 'h3' },
                { label: 'Div', value: 'div' },
                { label: 'HTML', value: 'html' },
            ]},
        ],
    },
    {
        name: 'ci-board',
        title: 'Board (Dashboard em Cards)',
        description: 'Prancheta de dashboard modular com cards arrastáveis (@ci/components).',
        icon: 'dashboard',
        category: '@ci/components',
        componentRef: BoardComponent,
        inputs: [
            { name: 'default', label: 'Prancheta Padrão', type: 'string', defaultValue: '' },
            { name: 'scope', label: 'Escopo', type: 'select', defaultValue: 'USER', options: [
                { label: 'Usuário (USER)', value: 'USER' },
                { label: 'Tenant (TENANT)', value: 'TENANT' },
            ]},
            { name: 'allowCustomization', label: 'Permitir Customização', type: 'boolean', defaultValue: true },
            { name: 'customTitle', label: 'Título Customizado', type: 'string', defaultValue: '' },
        ],
    },
    {
        name: 'ci-app-quick-card',
        title: 'App Quick Card',
        description: 'Cartão de atalho rápido para aplicativo (@ci/components).',
        icon: 'apps',
        category: '@ci/components',
        componentRef: AppQuickCardComponent,
        inputs: [
            { name: 'appName', label: 'Nome do App', type: 'string', defaultValue: 'Aplicativo' },
            { name: 'appUrl', label: 'URL de Destino', type: 'string', defaultValue: '/painel' },
            { name: 'appIcon', label: 'Ícone Material', type: 'string', defaultValue: 'apps' },
            { name: 'appColor', label: 'Cor', type: 'color', defaultValue: '#3f51b5' },
            { name: 'appCategory', label: 'Categoria', type: 'string', defaultValue: 'Geral' },
            { name: 'appDescription', label: 'Descrição', type: 'textarea', defaultValue: '' },
        ],
    },
    {
        name: 'ci-cardboard',
        title: 'Cardboard',
        description: 'Container de cartão dinâmico (@ci/components/cardboard).',
        icon: 'crop_square',
        category: '@ci/components',
        componentRef: CardboardComponent,
        allowChildren: true,
        inputs: [
            { name: 'componentRef', label: 'Componente Referenciado', type: 'string', defaultValue: '' },
        ],
    },
    {
        name: 'ci-calendar',
        title: 'Calendar',
        description: 'Calendário com modos dia, mês e ano (@ci/components/calendar).',
        icon: 'calendar_month',
        category: '@ci/components',
        componentRef: CalendarComponent,
        inputs: [
            { name: 'viewMode', label: 'Modo de Visão', type: 'select', defaultValue: 'month', options: [
                { label: 'Dia', value: 'day' },
                { label: 'Mês', value: 'month' },
                { label: 'Ano', value: 'year' },
            ]},
        ],
    },
    {
        name: 'ci-action',
        title: 'Action Button',
        description: 'Botão de ação com ícone e rótulo (@ci/components/action).',
        icon: 'touch_app',
        category: '@ci/components',
        componentRef: ActionComponent,
        inputs: [
            { name: 'label', label: 'Rótulo', type: 'string', defaultValue: 'Ação' },
            { name: 'icon', label: 'Ícone Material', type: 'string', defaultValue: 'bolt' },
        ],
    },
    {
        name: 'ci-icon',
        title: 'CI Icon',
        description: 'Exibição de ícone Material, SVG ou Imagem (@ci/components).',
        icon: 'interests',
        category: '@ci/components',
        componentRef: IconComponent,
        inputs: [
            { name: 'mode', label: 'Modo', type: 'select', defaultValue: 'material', options: [
                { label: 'Material Icon', value: 'material' },
                { label: 'SVG', value: 'svg' },
                { label: 'Imagem', value: 'img' },
            ]},
            { name: 'icon', label: 'Nome / Caminho do Ícone', type: 'string', defaultValue: 'star' },
        ],
    },
    {
        name: 'ci-file',
        title: 'File Card',
        description: 'Visualização de arquivo/mídia com miniatura e descrição (@ci/components).',
        icon: 'insert_drive_file',
        category: '@ci/components',
        componentRef: FileComponent,
        inputs: [
            { name: 'title', label: 'Título', type: 'string', defaultValue: 'Arquivo' },
            { name: 'icon', label: 'Ícone', type: 'string', defaultValue: 'description' },
            { name: 'image', label: 'URL da Imagem', type: 'string', defaultValue: '' },
            { name: 'view', label: 'Modo de Visão', type: 'string', defaultValue: 'card' },
            { name: 'description', label: 'Descrição', type: 'textarea', defaultValue: '' },
        ],
    },
    {
        name: 'ci-navbar',
        title: 'Navbar',
        description: 'Barra de navegação superior com menus e perfil (@ci/components).',
        icon: 'web_asset',
        category: '@ci/components',
        componentRef: NavbarComponent,
        inputs: [
            { name: 'menuItens', label: 'Itens de Menu (JSON)', type: 'json', defaultValue: [] },
            { name: 'userMenuList', label: 'Menu do Usuário (JSON)', type: 'json', defaultValue: [] },
            { name: 'endMenu', label: 'Menu Direita (JSON)', type: 'json', defaultValue: [] },
        ],
    },
    {
        name: 'ci-l-nav',
        title: 'Left Nav (Menu Lateral)',
        description: 'Navegação lateral retrátil (@ci/components).',
        icon: 'menu_open',
        category: '@ci/components',
        componentRef: LNavComponent,
        allowChildren: true,
        inputs: [],
    },
    {
        name: 'ci-footer',
        title: 'Footer',
        description: 'Rodapé padrão da aplicação (@ci/components).',
        icon: 'call_to_action',
        category: '@ci/components',
        componentRef: FooterComponent,
        inputs: [],
    },
    {
        name: 'ci-status-bar',
        title: 'Status Bar',
        description: 'Barra de status inferior (@ci/components).',
        icon: 'horizontal_rule',
        category: '@ci/components',
        componentRef: StatusBarComponent,
        inputs: [],
    },
    {
        name: 'ci-logo',
        title: 'Logo',
        description: 'Logotipo clicável com link (@ci/components).',
        icon: 'verified',
        category: '@ci/components',
        componentRef: LogoComponent,
        inputs: [
            { name: 'link', label: 'Link de Destino', type: 'string', defaultValue: '/' },
        ],
    },
    {
        name: 'ci-pesquisar',
        title: 'Pesquisar',
        description: 'Componente de busca rápida (@ci/components).',
        icon: 'search',
        category: '@ci/components',
        componentRef: PesquisarComponent,
        inputs: [],
    },
    {
        name: 'ci-settings',
        title: 'Settings',
        description: 'Painel de configurações dinâmicas (@ci/components/settings).',
        icon: 'settings',
        category: '@ci/components',
        componentRef: SettingsComponent,
        inputs: [],
    },
    {
        name: 'ci-window',
        title: 'Window',
        description: 'Janela flutuante com suporte a conteúdo interno (@ci/components/window).',
        icon: 'picture_in_picture',
        category: '@ci/components',
        componentRef: WindowComponent,
        allowChildren: true,
        inputs: [],
    },
    {
        name: 'ci-terminal',
        title: 'Terminal',
        description: 'Emulador de terminal integrado (@ci/components/terminal).',
        icon: 'terminal',
        category: '@ci/components',
        componentRef: TerminalComponent,
        inputs: [
            { name: 'options', label: 'Opções xterm (JSON)', type: 'json', defaultValue: { theme: { background: '#000000' } } },
            { name: 'dataStream', label: 'Stream Inicial', type: 'textarea', defaultValue: '' },
        ],
    },
    {
        name: 'ci-keyboard',
        title: 'Keyboard (Sintetizador)',
        description: 'Teclado musical interativo (@ci/components/keyboard).',
        icon: 'piano',
        category: '@ci/components',
        componentRef: KeyboardComponent,
        inputs: [],
    },
    {
        name: 'aio-chat',
        title: 'AIO Chat Ultrassônico',
        description: 'Comunicação via áudio ultrassônico (@ci/components/aio).',
        icon: 'graphic_eq',
        category: '@ci/components/aio',
        componentRef: AIOChatComponent,
        inputs: [],
    },
];
