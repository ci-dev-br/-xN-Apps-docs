import { IAppDocumentation } from './app-docs.model';

export const APP_DOCUMENTATION_REGISTRY: Record<string, IAppDocumentation> = {
    Arquivos: {
        appKey: 'Arquivos',
        title: 'Arquivos',
        category: 'Produtividade',
        icon: 'folder_open',
        summary: 'Gerenciador corporativo centralizado de arquivos e diretórios corporativos com alta segurança.',
        features: [
            'Navegação estruturada por diretórios com pré-visualização de documentos',
            'Upload e download em lote com suporte a arquivos compactados',
            'Controle granular de acesso e auditoria de arquivos sensíveis'
        ],
        quickStart: [
            'Clique no botão de upload ou arraste arquivos para a janela do diretório.',
            'Organize seus documentos criando pastas com nomes descritivos.',
            'Utilize o menu de contexto com o botão direito para compartilhar ou mover itens.'
        ],
        tips: [
            'Pressione CTRL ao clicar em vários arquivos para seleção múltipla rápida.'
        ]
    },
    Cadastros: {
        appKey: 'Cadastros',
        title: 'Cadastros',
        category: 'Gestão',
        icon: 'contacts',
        summary: 'Centralização e padronização dos dados de clientes, parceiros e fornecedores da sua empresa.',
        features: [
            'Validação automática de documentos fiscais e dados cadastrais',
            'Categorização inteligente com tags e regras de classificação',
            'Histórico completo de alterações e vínculos operacionais'
        ],
        quickStart: [
            'Acesse o formulário de cadastro pelo botão "Novo Registro".',
            'Preencha as informações obrigatórias e anexe documentos de validação.',
            'Salve para sincronizar automaticamente com os módulos Financeiro e Vendas.'
        ]
    },
    Codex: {
        appKey: 'Codex',
        title: 'Codex IDE',
        category: 'Desenvolvimento',
        icon: 'code',
        summary: 'Ambiente de desenvolvimento integrado (IDE) em nuvem para edição, testes e manutenção de código.',
        features: [
            'Editor com destaque de sintaxe, linting e autocompletar inteligente',
            'Histórico de alterações com rollback instantâneo para versões anteriores',
            'Sandbox seguro para execução e testes de scripts'
        ],
        quickStart: [
            'Selecione ou crie um arquivo na árvore de navegação lateral.',
            'Edite o código com suporte a atalhos convencionais de teclado.',
            'Execute ou salve suas alterações para compilação automática.'
        ]
    },
    CMS: {
        appKey: 'CMS',
        title: 'CMS - Gestor de Conteúdo',
        category: 'Comunicação',
        icon: 'article',
        summary: 'Criação, edição e publicação simplificada de páginas, artigos e portais web responsivos.',
        features: [
            'Editor de texto rico e componentes modulares de layout',
            'Otimização integrada para mecanismos de busca (SEO)',
            'Gerenciamento de mídias e fluxo de aprovação de publicação'
        ],
        quickStart: [
            'Escolha um template ou inicie uma página em branco.',
            'Adicione títulos, blocos de texto, imagens e botões de chamada.',
            'Publique instantaneamente para o seu domínio configurado.'
        ]
    },
    CRM: {
        appKey: 'CRM',
        title: 'CRM de Relacionamento',
        category: 'Vendas',
        icon: 'people',
        summary: 'Acompanhe leads, contatos e oportunidades comerciais em um funil de vendas intuitivo.',
        features: [
            'Kanban visual de oportunidades por estágio do pipeline comercial',
            'Registro de interações, notas de reuniões e lembretes automáticos',
            'Previsão de fechamento e relatórios de conversão'
        ],
        quickStart: [
            'Cadastre novos leads e classifique pelo potencial de compra.',
            'Mova os cards entre as colunas conforme o progresso da negociação.',
            'Conclua a oportunidade para gerar pedidos no Financeiro.'
        ]
    },
    DevTools: {
        appKey: 'DevTools',
        title: 'DevTools & Instrumentação',
        category: 'Desenvolvimento',
        icon: 'build',
        summary: 'Painel para diagnóstico técnico, inspeção de requisições e monitoramento de performance.',
        features: [
            'Inspetor de tráfego de rede e endpoints com métricas de latência',
            'Validador e formatador interativo de payloads JSON',
            'Visualização de logs e telemetria de componentes em tempo real'
        ],
        quickStart: [
            'Abra a aba de logs para verificar eventos recentes do sistema.',
            'Utilize a ferramenta de testes para simular requisições de API.',
            'Inspecione a resposta e cabeçalhos detalhados das transações.'
        ]
    },
    Dynamic: {
        appKey: 'Dynamic',
        title: 'Dynamic XD',
        category: 'Design',
        icon: 'dashboard_customize',
        summary: 'Prototipação rápida e modelagem visual de interfaces de usuário com componentes pré-construídos.',
        features: [
            'Arrastar e soltar (drag-and-drop) de elementos gráficos responsivos',
            'Geração automática de estilos e especificações para desenvolvedores',
            'Compartilhamento de protótipos funcionais para validação de clientes'
        ],
        quickStart: [
            'Selecione uma prancheta de trabalho no menu superior.',
            'Arraste componentes da biblioteca para montar sua interface.',
            'Clique no botão de visualização interativa para testar a navegabilidade.'
        ]
    },
    Financeiro: {
        appKey: 'Financeiro',
        title: 'Financeiro',
        category: 'Gestão',
        icon: 'account_balance_wallet',
        summary: 'Controle rigoroso do fluxo de caixa, contas a pagar e receber e conciliação bancária.',
        features: [
            'Dashboard executivo em tempo real com saldos e projeções financeiras',
            'Controle minucioso de despesas, centros de custo e cobranças recorrentes',
            'Exportação e relatórios contábeis para conformidade fiscal'
        ],
        quickStart: [
            'Lance receitas e despesas informando categoria e vencimento.',
            'Acompanhe o gráfico de fluxo de caixa para antecipar necessidades de caixa.',
            'Efetue conciliações bancárias com comprovantes anexados.'
        ]
    },
    Formularios: {
        appKey: 'Formularios',
        title: 'Formulários Dinâmicos',
        category: 'Produtividade',
        icon: 'dynamic_form',
        summary: 'Criação ágil de formulários, pesquisas de satisfação e formulários de coleta com lógica condicional.',
        features: [
            'Diversos tipos de campos (texto, seleção, upload, assinatura)',
            'Regras de validação e desvio condicional de perguntas',
            'Relatórios tabulados e exportação instantânea de respostas'
        ],
        quickStart: [
            'Crie um formulário e adicione as perguntas desejadas.',
            'Configure as validações e ative o link de compartilhamento.',
            'Acompanhe as respostas em tempo real na aba de resultados.'
        ]
    },
    Gerencial: {
        appKey: 'Gerencial',
        title: 'Painel Gerencial',
        category: 'Administração',
        icon: 'settings_suggest',
        summary: 'Centro de governança para gestão de usuários, aplicações, permissões e saúde do ecossistema.',
        features: [
            'Gestão de papéis de acesso (USER, ADMIN, MASTER)',
            'Catálogo e licenciamento de aplicações para contas de usuário',
            'Monitoramento de dispositivos conectados e auditoria'
        ],
        quickStart: [
            'Navegue entre as abas para gerenciar dispositivos, apps e usuários.',
            'Utilize a Loja para disponibilizar novas ferramentas para a equipe.',
            'Consulte os logs de auditoria para garantir conformidade corporativa.'
        ]
    },
    Grupos: {
        appKey: 'Grupos',
        title: 'Grupos & Equipes',
        category: 'Administração',
        icon: 'groups',
        summary: 'Organização de colaboradores em equipes com controle centralizado de papéis e escopos.',
        features: [
            'Criação de grupos departamentais e projetos transversais',
            'Atribuição em lote de permissões e aplicações aos membros',
            'Políticas de comunicação segmentada por time'
        ],
        quickStart: [
            'Crie um grupo informando nome do departamento ou projeto.',
            'Adicione membros através do e-mail ou identificador institucional.',
            'Defina as permissões que todos os membros do grupo herdarão.'
        ]
    },
    Icons: {
        appKey: 'Icons',
        title: 'Catálogo de Ícones',
        category: 'Design',
        icon: 'palette',
        summary: 'Galeria vetorial de ícones e pictogramas oficiais para padronização visual da plataforma.',
        features: [
            'Busca instantânea por termos semânticos e categorias',
            'Prévia interativa com suporte a SVG e fontes de ícones',
            'Cópia de código com um clique para desenvolvedores'
        ],
        quickStart: [
            'Digite o nome ou conceito desejado na barra de pesquisa.',
            'Clique no ícone escolhido para copiar seu identificador.',
            'Cole diretamente no seu componente de interface.'
        ]
    },
    Imersao: {
        appKey: 'Imersao',
        title: 'Imersão 3D & Virtual',
        category: 'Mídia',
        icon: 'view_in_ar',
        summary: 'Ambiente tridimensional interativo para visualização de espaços, produtos e simulações.',
        features: [
            'Navegação espacial fluida em primeira ou terceira pessoa',
            'Carregamento otimizado de cenários e modelos 3D',
            'Interação com elementos clicáveis e pontos de interesse'
        ],
        quickStart: [
            'Utilize o mouse ou touchpad para girar a câmera de visão.',
            'Use as teclas W, A, S, D para caminhar pelo ambiente virtual.',
            'Clique em objetos com realce para inspecionar informações.'
        ]
    },
    Infra: {
        appKey: 'Infra',
        title: 'Infraestrutura',
        category: 'Desenvolvimento',
        icon: 'dns',
        summary: 'Monitoramento de recursos computacionais, servidores, conexões ativas e containers.',
        features: [
            'Métricas de uso de CPU, memória RAM e armazenamento em disco',
            'Status dos serviços dependentes e conectividade com bancos de dados',
            'Alertas preventivos para gargalos de capacidade'
        ],
        quickStart: [
            'Verifique os indicadores de saúde dos servidores no dashboard principal.',
            'Inspecione os nós e containers em execução.',
            'Configure limiares de alerta para notificações automáticas.'
        ]
    },
    Installation: {
        appKey: 'Installation',
        title: 'Instalação e Setup',
        category: 'Administração',
        icon: 'settings_system_daydream',
        summary: 'Assistente guiado para provisionamento inicial e parametrização do ambiente corporativo.',
        features: [
            'Validação de pré-requisitos e variáveis de ambiente',
            'Configuração guiada de chaves de API, e-mail e provedores de nuvem',
            'Testes automatizados de conectividade dos serviços'
        ],
        quickStart: [
            'Siga o passo a passo pelas etapas exibidas na barra de progresso.',
            'Insira as credenciais de infraestrutura solicitadas.',
            'Finalize para aplicar as configurações e inicializar o sistema.'
        ]
    },
    LowCode: {
        appKey: 'LowCode',
        title: 'Construtor LowCode',
        category: 'Desenvolvimento',
        icon: 'auto_fix_high',
        summary: 'Construa módulos, automações e fluxos de dados rapidamente sem precisar codificar do zero.',
        features: [
            'Modelador visual de fluxos de processo e gatilhos de eventos',
            'Conectores prontos para bancos de dados e APIs REST',
            'Deploy instantâneo com versionamento integrado'
        ],
        quickStart: [
            'Defina o evento disparador (ex: criação de registro ou cron).',
            'Conecte nós de transformação de dados e ações de envio.',
            'Teste o fluxo e clique em "Publicar".'
        ]
    },
    Mensagens: {
        appKey: 'Mensagens',
        title: 'Mensagens Criptografadas',
        category: 'Comunicação',
        icon: 'chat',
        summary: 'Troca de mensagens seguras e arquivos com criptografia ponta a ponta e proteção anti-vazamento.',
        features: [
            'Criptografia de mensagens e anexos no cliente antes do salvamento',
            'Proteção visual com modulação de caracteres anti-captura de tela',
            'Virtualização eficiente de balões para máxima fluidez em dispositivos móveis'
        ],
        quickStart: [
            'Selecione uma conversa na barra lateral ou inicie um novo chat.',
            'Digite sua mensagem no campo inferior e pressione Enter para enviar.',
            'Anexe documentos ou imagens pelo botão de clipe.'
        ],
        tips: [
            'As mensagens são decodificadas exclusivamente na sua sessão com sua chave de acesso.'
        ]
    },
    Organizacao: {
        appKey: 'Organizacao',
        title: 'Organização Corporativa',
        category: 'Gestão',
        icon: 'corporate_fare',
        summary: 'Estruturação da hierarquia da empresa, unidades operacionais, filiais e centros de resultado.',
        features: [
            'Organograma dinâmico com navegação multinível',
            'Vinculação de filiais, departamentos e responsáveis de área',
            'Políticas corporativas distribuídas por unidade'
        ],
        quickStart: [
            'Visualize a estrutura corporativa no diagrama interativo.',
            'Cadastre novas filiais ou unidades de negócio.',
            'Atribua gestores responsáveis para cada departamento.'
        ]
    },
    Produtos: {
        appKey: 'Produtos',
        title: 'Catálogo de Produtos',
        category: 'Vendas',
        icon: 'inventory_2',
        summary: 'Gestão integrada de catálogo, fichas técnicas, tabelas de preço e controle de estoque.',
        features: [
            'Cadastro de produtos com múltiplos códigos de barras (EAN, SKU)',
            'Controle de variações (cores, tamanhos, lotes e validade)',
            'Tabelas de preço dinâmicas por cliente ou região'
        ],
        quickStart: [
            'Cadastre produtos com fotos, descrições detalhadas e código SKU.',
            'Defina o preço de custo e margens de venda.',
            'Acompanhe o saldo de estoque atualizado em tempo real.'
        ]
    },
    Profile: {
        appKey: 'Profile',
        title: 'Meu Perfil',
        category: 'Pessoal',
        icon: 'person',
        summary: 'Gerenciamento dos seus dados pessoais, preferências de interface e chaves de segurança.',
        features: [
            'Atualização de foto de perfil, dados de contato e biografia',
            'Configuração de autenticação em dois fatores (2FA) e senhas',
            'Histórico de sessões ativas e dispositivos autorizados'
        ],
        quickStart: [
            'Mantenha seus dados de contato e telefone atualizados.',
            'Ative métodos reforçados de autenticação para maior segurança.',
            'Personalize o tema e notificações conforme sua conveniência.'
        ]
    },
    Projetos: {
        appKey: 'Projetos',
        title: 'Projetos & Tarefas',
        category: 'Produtividade',
        icon: 'assignment',
        summary: 'Planejamento e acompanhamento ágil de entregas, tarefas e metas da equipe com metodologia ágil.',
        features: [
            'Quadro Kanban com colunas personalizáveis e limite de trabalho em progresso',
            'Controle de prazos, responsáveis e estimativas de horas',
            'Gráficos de burndown e relatórios de velocidade de entrega'
        ],
        quickStart: [
            'Crie um projeto e divida os objetivos em tarefas objetivas.',
            'Atribua responsáveis e prazos de conclusão para cada entrega.',
            'Arraste as tarefas pelo Kanban até sua conclusão.'
        ]
    },
    SEO: {
        appKey: 'SEO',
        title: 'SEO & Marketing Orgânico',
        category: 'Comunicação',
        icon: 'troubleshoot',
        summary: 'Otimização de páginas, auditoria técnica de metatags e análise de termos de busca.',
        features: [
            'Auditoria de tags OpenGraph, títulos e meta descriptions',
            'Simulação de pré-visualização em redes sociais e buscadores',
            'Dicas automatizadas para melhoria do Core Web Vitals'
        ],
        quickStart: [
            'Informe a URL da página que deseja analisar.',
            'Verifique a pontuação de conformidade e as oportunidades sugeridas.',
            'Ajuste as tags no CMS e solicite nova validação.'
        ]
    },
    Threejs: {
        appKey: 'Threejs',
        title: 'Three.js & Gráficos 3D',
        category: 'Design',
        icon: 'view_in_ar',
        summary: 'Visualizador acelerado por hardware para modelos 3D nos formatos GLTF, OBJ e FBX.',
        features: [
            'Renderização WebGL com controle de iluminação, materiais e sombras',
            'Inspeção detalhada de vértices, polígonos e malhas de colisão',
            'Animação de esqueletos e ossos (skeletal animation)'
        ],
        quickStart: [
            'Arraste um modelo 3D compatível para a área do visualizador.',
            'Ajuste os parâmetros de luz e reflexo no painel lateral.',
            'Rotacione e aproxime a câmera com o mouse.'
        ]
    },
    Treinamento: {
        appKey: 'Treinamento',
        title: 'Capacitação & Treinamento',
        category: 'Produtividade',
        icon: 'school',
        summary: 'Cursos internos, trilhas de aprendizado e materiais didáticos para capacitação contínua.',
        features: [
            'Módulos de aprendizado em vídeo, texto e questionários de fixação',
            'Controle de progresso individual e emissão de certificados',
            'Fórum de dúvidas com tutores e colegas de curso'
        ],
        quickStart: [
            'Escolha uma trilha de capacitação correspondente à sua área.',
            'Assista aos conteúdos e realize as avaliações práticas.',
            'Obtenha a certificação para validar seus conhecimentos.'
        ]
    },
    Vendas: {
        appKey: 'Vendas',
        title: 'Vendas & Faturamento',
        category: 'Vendas',
        icon: 'point_of_sale',
        summary: 'Gestão completa do ciclo de pedidos de venda, emissão de faturas e controle de comissões.',
        features: [
            'Emissão rápida de propostas comerciais com envio direto ao cliente',
            'Conversão automática de orçamentos aprovados em pedidos faturados',
            'Cálculo integrado de impostos, frete e comissões de vendedores'
        ],
        quickStart: [
            'Inicie uma nova proposta selecionando o cliente e os produtos.',
            'Aplique descontos ou condições especiais de pagamento.',
            'Confirme o pedido para atualizar o estoque e enviar para faturamento.'
        ]
    },
    Loja: {
        appKey: 'Loja',
        title: 'Loja de Aplicativos',
        category: 'Geral',
        icon: 'storefront',
        summary: 'Descubra, ative e integre novas aplicações e ferramentas à sua conta na plataforma.',
        features: [
            'Catálogo completo de aplicações organizadas por categoria',
            'Ativação e desativação com um clique para seu usuário',
            'Mini documentação explicativa e guia de início rápido integrado'
        ],
        quickStart: [
            'Navegue pelo catálogo de aplicações disponíveis.',
            'Clique em "Ativar Aplicação" no app desejado para habilitá-lo na sua conta.',
            'Consulte a mini documentação exibida para começar a utilizar imediatamente.'
        ]
    }
};
