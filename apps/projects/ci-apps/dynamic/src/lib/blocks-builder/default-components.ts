import { DynamicComponentDefinition } from './blocks-builder.models';

/**
 * Catálogo padrão de componentes disponíveis para construção de telas em blocos no Dynamic.
 */
export const DYNAMIC_DEFAULT_COMPONENTS: DynamicComponentDefinition[] = [
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
];
