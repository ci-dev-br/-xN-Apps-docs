import { Application } from "@ci/portal-api";

function getColor() {
    const hex = () => (13 + Math.floor(Math.random() * 3)).toString(16);
    return `#${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}`.toUpperCase()
}

export interface IApp extends Application {
    color?: string;
    url?: string;
    icon?: string;
    type?: string;
    name?: string;
    shortDescription?: string; // Campo novo para descrição curta
    description?: string;      // Campo existente para descrição longa
    __cta_hndlred?: number;
    __presentation_order?: number;
}

/**
 * Pre-loaded apps available in the painel
 */
export const CI_STATIC_APPS: IApp[] = [
    {
        categoria: 'System',
        shortDescription: 'Gerencie arquivos do sistema com segurança e agilidade. Navegue entre diretórios, realize uploads e mantenha a organização dos dados corporativos essenciais.',
        description: 'O módulo Arquivos oferece uma solução robusta para o gerenciamento centralizado de dados dentro do servidor. Com ele, administradores e usuários autorizados podem navegar pela estrutura de diretórios, visualizar prévias de documentos e executar operações de manutenção com facilidade. A ferramenta suporta upload em lote, controle de versionamento básico e permissões granulares de acesso, garantindo que a informação sensível permaneça protegida. É a ferramenta ideal para manter a integridade dos dados organizacionais, permitindo auditorias rápidas, organização eficiente de logs, backups e mídias do sistema, tudo através de uma interface web intuitiva.',
        color: getColor(),
        url: '/Arquivos',
        name: 'Arquivos',
        roles: ['ADMIN', 'MASTER'],
        icon: 'files',
        type: 'svg'
    },
    {
        shortDescription: 'Centralize os dados de clientes, fornecedores e parceiros. Mantenha as informações vitais da sua rede de contatos sempre atualizadas, organizadas e acessíveis.',
        description: 'O módulo Cadastros atua como a espinha dorsal da informação corporativa. Ele permite o registro detalhado e a manutenção de dados de todas as entidades que interagem com a empresa, incluindo clientes, fornecedores, parceiros e colaboradores. Com recursos avançados de validação de dados e campos personalizados, o sistema evita duplicidades e garante a consistência das informações. Além disso, integra-se nativamente com outros módulos como Vendas e Financeiro, automatizando o preenchimento de documentos e facilitando o fluxo de trabalho operacional. A gestão eficiente destes cadastros é fundamental para estratégias de CRM e para a conformidade fiscal da organização.',
        color: getColor(),
        url: '/Cadastros',
        name: 'Cadastros',
        roles: ['MASTER'],
        icon: 'cadastros',
        type: 'svg'
    },
    {
        shortDescription: 'Editor de código-fonte completo integrado ao navegador. Ferramentas avançadas para programadores que buscam agilidade, controle de versão e manutenção de scripts.',
        description: 'O Codex é um ambiente de desenvolvimento integrado (IDE) projetado para oferecer uma experiência de codificação completa sem sair do portal. Suportando múltiplas linguagens de programação com destaque de sintaxe, autocompletar inteligente e ferramentas de linting, ele permite que desenvolvedores realizem ajustes rápidos ou construam módulos complexos. A plataforma inclui histórico de revisões, facilitando o rollback de alterações, e oferece um ambiente seguro ("sandbox") para testar snippets de código antes da implantação em produção. É a ferramenta definitiva para a equipe técnica realizar a manutenção, correção de bugs e expansão das capacidades do sistema em tempo real.',
        color: getColor(),
        url: '/Codex',
        name: 'Codex',
        roles: ['MASTER'],
        icon: 'codex',
        type: 'svg'
    },
    {
        shortDescription: 'Conjunto de utilitários essenciais para análise e depuração do sistema. Monitore performance, inspecione requisições e otimize o funcionamento da aplicação.',
        description: 'O DevTools é um painel de instrumentação avançada destinado à equipe de engenharia e suporte técnico. Ele fornece visibilidade profunda sobre o comportamento da aplicação, permitindo monitorar o consumo de recursos, analisar logs de erro em tempo real e inspecionar o tráfego de rede das APIs internas. Com ferramentas para testar endpoints, validar estruturas de dados JSON e simular diferentes condições de ambiente, o DevTools é indispensável para diagnósticos precisos. Ele acelera o ciclo de resolução de problemas e garante que a performance do portal se mantenha nos níveis mais elevados, identificando gargalos antes que afetem o usuário final.',
        color: getColor(),
        url: '/DevTools',
        name: 'DevTools',
        roles: ['MASTER'],
        icon: 'dev-tools',
        type: 'svg'
    },
    {
        shortDescription: 'Crie interfaces e protótipos de alta fidelidade com facilidade. Uma ferramenta de design focada na experiência do usuário e na agilidade de desenvolvimento visual.',
        description: 'O Dynamic XD é uma plataforma de design e prototipação voltada para a criação ágil de interfaces de usuário. Ele permite que designers e desenvolvedores colaborem na construção de layouts responsivos, definindo fluxos de navegação e interações visuais sem a necessidade de código complexo inicial. Com uma biblioteca de componentes pré-construídos e suporte a drag-and-drop, é possível transformar ideias abstratas em protótipos funcionais rapidamente. A ferramenta facilita a validação de conceitos com stakeholders e gera automaticamente os estilos CSS e especificações técnicas necessárias para a implementação final, reduzindo drasticamente o tempo entre o design e o produto final.',
        color: getColor(),
        url: '/Dynamic',
        name: 'Dynamic XD',
        roles: ['MASTER'],
        icon: 'dynamic',
        type: 'svg'
    },
    {
        shortDescription: 'Controle total sobre o fluxo de caixa, contas a pagar e receber. Uma suíte completa para a gestão contábil e financeira, garantindo saúde econômica para o negócio.',
        description: 'O módulo Financeiro é o centro de comando para a saúde econômica da organização. Ele oferece ferramentas abrangentes para o gerenciamento de contas a pagar e receber, conciliação bancária, fluxo de caixa e emissão de notas fiscais. Com dashboards intuitivos, gestores podem visualizar a performance financeira em tempo real, gerar relatórios de DRE e balancetes com poucos cliques. O sistema permite a automação de cobranças recorrentes, o controle de centros de custo e a integração direta com os gateways de pagamento. Projetado para garantir conformidade fiscal e transparência, ele fornece os dados necessários para tomadas de decisão estratégicas e planejamento orçamentário seguro.',
        color: getColor(),
        url: '/Financeiro',
        name: 'Financeiro',
        roles: ['MASTER'],
        icon: 'financeiro',
        type: 'svg'
    },
    {
        shortDescription: 'Construa formulários dinâmicos para coleta de dados. Personalize campos, validações e fluxos de resposta para atender a qualquer necessidade de pesquisa ou cadastro.',
        description: 'A ferramenta Formulários permite a criação rápida e flexível de interfaces para coleta de dados. Seja para pesquisas de satisfação, inscrições em eventos ou processos de auditoria interna, o sistema oferece um construtor visual intuitivo onde é possível arrastar e soltar diversos tipos de campos. Com suporte a lógica condicional, as perguntas podem se adaptar com base nas respostas anteriores do usuário. Todos os dados coletados são automaticamente tabulados e podem ser exportados para análise ou integrados a outros sistemas via webhooks. É a solução ideal para digitalizar processos baseados em papel e padronizar a entrada de informações em toda a empresa.',
        color: getColor(),
        url: '/Formularios',
        name: 'Formularios',
        roles: ['USER', 'MASTER'],
        icon: 'formularios',
        type: 'svg'
    },
    {
        shortDescription: 'Painel executivo com indicadores chave de desempenho (KPIs). Visualize métricas estratégicas em tempo real para embasar decisões gerenciais de alto nível.',
        description: 'O módulo Gerencial transforma dados brutos em inteligência de negócios acionável. Através de dashboards personalizáveis e visualizações de dados interativas, ele agrega informações de todos os outros setores — vendas, financeiro, operações — para oferecer uma visão holística da empresa. Gestores podem acompanhar KPIs em tempo real, identificar tendências de mercado e monitorar o cumprimento de metas organizacionais. Com recursos de drill-down, é possível investigar a causa raiz de variações nos números, indo do macro ao micro detalhe. Esta ferramenta é essencial para a governança corporativa, garantindo que a liderança tenha as informações precisas para pilotar o negócio.',
        color: getColor(),
        url: '/Gerencial',
        name: 'Gerencial',
        roles: ['MASTER'],
        icon: 'gerencial',
        type: 'svg'
    },
    {
        shortDescription: 'Acesse uma vasta biblioteca de ícones vetoriais padronizados. Recursos visuais prontos para uso em projetos de design, desenvolvimento e documentação.',
        description: 'O módulo Icons serve como um repositório centralizado de ativos visuais da empresa. Ele disponibiliza uma extensa coleção de ícones vetoriais (SVG) e fontes de ícones, todos padronizados de acordo com a identidade visual da marca. Desenvolvedores e designers podem buscar, visualizar e copiar códigos de implementação ou baixar arquivos em diversos formatos e tamanhos. A biblioteca é constantemente atualizada para incluir novas representações gráficas necessárias para os produtos digitais. Isso garante a consistência visual em todas as aplicações e materiais de comunicação, agilizando o trabalho das equipes de front-end e UX/UI ao eliminar a necessidade de desenhar ícones do zero.',
        color: getColor(),
        url: '/Icons',
        name: 'Icons',
        roles: ['MASTER'],
        icon: 'icones',
        type: 'svg'
    },
    {
        shortDescription: 'Ambiente dedicado ao aprendizado profundo e onboarding. Trilhas de conhecimento estruturadas para acelerar a adaptação e o desenvolvimento de novas competências.',
        description: 'A plataforma Imersão foi desenhada para facilitar a transferência de conhecimento tácito e explícito dentro da organização. Ideal para o onboarding de novos colaboradores ou para a reciclagem de equipes, ela organiza o conteúdo em trilhas de aprendizado interativas e sequenciais. O sistema suporta diversos formatos de mídia, incluindo vídeos, artigos e quizzes de verificação de conhecimento. Ao focar na experiência do usuário, a Imersão garante maior engajamento e retenção de informações. Gestores podem acompanhar o progresso individual de cada membro, identificando lacunas de competência e garantindo que todos estejam alinhados com a cultura e os processos da empresa.',
        color: getColor(),
        url: '/Imersao',
        name: 'Imersao',
        roles: ['MASTER'],
        icon: 'imersao',
        type: 'svg'
    },
    {
        shortDescription: 'Gerenciamento centralizado da infraestrutura de TI. Monitore servidores, serviços em nuvem e recursos de rede para garantir a disponibilidade contínua do sistema.',
        description: 'O módulo Infra oferece controle total sobre os ativos tecnológicos que sustentam as operações da empresa. Ele permite o monitoramento em tempo real da saúde dos servidores, balanceadores de carga, bancos de dados e serviços de nuvem. Com alertas configuráveis para anomalias de CPU, memória ou latência de rede, a equipe de DevOps pode agir proativamente antes que incidentes ocorram. Além do monitoramento, a ferramenta facilita o gerenciamento de configurações, deploys automatizados e a escalabilidade dos recursos. É o painel de controle indispensável para garantir a alta disponibilidade (uptime), a segurança perimetral e a eficiência operacional de toda a infraestrutura tecnológica.',
        color: getColor(),
        url: '/Infra',
        name: 'Infra',
        roles: ['MASTER'],
        icon: 'infra',
        type: 'svg'
    },
    {
        shortDescription: 'Gerencie a instalação e ativação de novos módulos e funcionalidades. Um assistente completo para configurar e implantar recursos adicionais no seu ambiente.',
        description: 'O módulo Instalação simplifica o processo de expansão e atualização do ecossistema de software. Ele atua como um gerenciador de pacotes e assistente de configuração (wizard), guiando o administrador através das etapas necessárias para ativar novas funcionalidades ou integrar serviços de terceiros. O sistema verifica automaticamente dependências, compatibilidade de versões e pré-requisitos de sistema antes de executar qualquer alteração. Além disso, mantém um histórico detalhado de todas as instalações e atualizações realizadas, facilitando a auditoria e a manutenção. Com ele, a implementação de novos recursos torna-se um processo seguro, padronizado e livre de erros manuais.',
        color: getColor(),
        url: '/Instalacao',
        name: 'Instalacao',
        roles: ['MASTER'],
        icon: 'instalacao',
        type: 'svg'
    },
    {
        shortDescription: 'Desenvolva aplicações poderosas com o mínimo de programação manual. Uma plataforma ágil que democratiza a criação de software através de interfaces visuais.',
        description: 'A plataforma LowCode revoluciona a forma como soluções internas são construídas, permitindo que usuários com pouco conhecimento técnico criem aplicações funcionais. Utilizando uma interface visual de arrastar e soltar, é possível modelar bancos de dados, desenhar interfaces e definir lógicas de negócio complexas sem escrever milhares de linhas de código. O sistema abstrai a complexidade técnica, cuidando da segurança e da escalabilidade em segundo plano. Isso reduz drasticamente o "time-to-market" de novas ferramentas internas e empodera as áreas de negócio a resolverem seus próprios problemas de automação, liberando a equipe de desenvolvimento para focar em desafios estruturais.',
        color: getColor(),
        url: '/LowCode',
        name: 'LowCode',
        roles: ['MASTER'],
        icon: 'low-code',
        type: 'svg'
    },
    {
        shortDescription: 'Hub central de comunicação interna e externa. Envie notificações, gerencie chats e mantenha o histórico de conversas seguro e organizado em um só lugar.',
        description: 'O módulo Mensagens centraliza toda a comunicação da plataforma, eliminando a dispersão de informações em canais não oficiais. Ele suporta mensagens diretas entre usuários, grupos de trabalho e notificações broadcast para toda a organização. Com recursos de criptografia e arquivamento seguro, garante a privacidade e a conformidade das trocas de informações corporativas. Além da comunicação humana, o sistema serve como inbox para alertas automáticos do sistema, informando sobre tarefas pendentes, aprovações necessárias ou atualizações de status. A integração com e-mail e push notifications garante que nenhuma mensagem crítica seja perdida, mantendo as equipes conectadas e alinhadas.',
        color: getColor(),
        url: '/Mensagens',
        name: 'Mensagens',
        roles: ['USER', 'MASTER'],
        icon: 'mensagens',
        type: 'svg'
    },
    {
        shortDescription: 'Ferramentas para maximizar a produtividade pessoal e profissional. Agendas, listas de tarefas e anotações integradas para manter o foco no que realmente importa.',
        description: 'O módulo Organização é uma suíte de produtividade desenhada para otimizar a gestão do tempo e das atividades diárias. Ele combina funcionalidades de calendário compartilhado, listas de tarefas (to-do lists) hierárquicas e um sistema de anotações ricas. Usuários podem agendar reuniões verificando a disponibilidade dos colegas, definir lembretes para prazos importantes e categorizar suas demandas por prioridade ou projeto. A integração com outros módulos permite transformar pendências de projetos ou vendas diretamente em tarefas pessoais. Focado na eficiência, este módulo ajuda a reduzir a carga cognitiva, garantindo que profissionais e equipes mantenham o foco na execução e nos resultados.',
        color: getColor(),
        url: '/Organizacao',
        name: 'Organizacao',
        roles: ['MASTER'],
        icon: 'organizacao',
        type: 'svg'
    },
    {
        shortDescription: 'Catálogo completo para gestão de produtos e serviços. Controle estoque, variações, preços e especificações técnicas com detalhamento e precisão.',
        description: 'O módulo Produtos é a base para as operações comerciais e de estoque. Ele permite o cadastro exaustivo de itens, suportando múltiplas variantes (como cor, tamanho, voltagem), imagens em alta resolução, fichas técnicas e códigos de barras (EAN/UPC). O sistema gerencia níveis de estoque em múltiplos depósitos, alerta sobre pontos de reposição e controla a movimentação de entrada e saída de mercadorias. Além disso, permite a gestão de listas de preços diferenciadas e regras de tributação. Essencial para empresas de varejo, distribuição ou manufatura, ele garante que o portfólio de ofertas esteja sempre organizado, atualizado e pronto para ser comercializado nos canais de venda.',
        color: getColor(),
        url: '/Produtos',
        name: 'Produtos',
        roles: ['MASTER'],
        icon: 'produtos',
        type: 'svg'
    },
    {
        shortDescription: 'Área pessoal para gestão de conta e preferências. Atualize dados cadastrais, configure segurança, notificações e personalize sua experiência no sistema.',
        description: 'A área de Profile é o espaço onde cada usuário detém controle sobre sua identidade e experiência dentro da plataforma. Aqui, é possível atualizar informações pessoais, gerenciar credenciais de acesso, alterar senhas e configurar autenticação de dois fatores (2FA) para maior segurança. O módulo também permite a personalização da interface, como escolha de temas (claro/escuro) e preferências de idioma. Além disso, o usuário pode definir granularmente suas preferências de notificação, escolhendo quais alertas deseja receber e por quais canais. É um componente vital para garantir a privacidade, a segurança individual e o conforto no uso diário das ferramentas corporativas.',
        color: getColor(),
        url: '/Profile',
        name: 'Profile',
        roles: ['MASTER'],
        icon: 'perfil',
        type: 'svg'
    },
    {
        shortDescription: 'Gestão completa do ciclo de vida de projetos. Planeje cronogramas, delegue tarefas e acompanhe o progresso das entregas com metodologias ágeis ou tradicionais.',
        description: 'O módulo Projetos oferece uma estrutura robusta para o gerenciamento de iniciativas complexas, do planejamento à entrega final. Compatível com metodologias ágeis (Kanban, Scrum) e tradicionais (Gantt), ele permite que gestores definam escopos, aloquem recursos e estipulem prazos realistas. A ferramenta facilita a colaboração da equipe através de comentários em tarefas, compartilhamento de arquivos e atualizações de status em tempo real. Relatórios de progresso e análise de burn-down ajudam a identificar gargalos e desvios de cronograma precocemente. É a solução ideal para manter equipes multidisciplinares alinhadas, garantindo que os objetivos estratégicos sejam atingidos dentro do prazo e do orçamento.',
        color: getColor(),
        url: '/Projetos',
        name: 'Projetos',
        roles: ['MASTER'],
        icon: 'projetos',
        type: 'svg'
    },
    {
        shortDescription: 'Otimize a presença digital com ferramentas de SEO avançadas. Analise palavras-chave, monitore rankings e melhore a visibilidade do seu conteúdo nos motores de busca.',
        description: 'O módulo SEO é um conjunto de ferramentas analíticas e operacionais focado na otimização para motores de busca. Ele permite auditar páginas do site em busca de falhas técnicas, analisar a densidade de palavras-chave e monitorar o ranking de termos estratégicos ao longo do tempo. O sistema oferece sugestões de melhoria para meta-tags, estrutura de links internos e performance de carregamento (Core Web Vitals). Além disso, permite a análise da concorrência e o rastreamento de backlinks. Ideal para equipes de marketing e conteúdo, este módulo fornece os insights necessários para aumentar o tráfego orgânico, melhorar a autoridade do domínio e garantir que a marca seja encontrada pelo seu público-alvo.',
        color: getColor(),
        url: '/SEO',
        name: 'SEO',
        roles: ['MASTER'],
        icon: 'seo',
        type: 'svg'
    },
    {
        shortDescription: 'Crie e manipule experiências gráficas 3D interativas na web. Ferramentas poderosas baseadas em WebGL para visualização de produtos, dados e ambientes virtuais.',
        description: 'O módulo Threejs integra capacidades avançadas de computação gráfica 3D diretamente ao navegador. Baseado na biblioteca WebGL, ele permite a importação, criação e manipulação de modelos tridimensionais complexos com texturas, iluminação e física realista. É a ferramenta perfeita para desenvolver configuradores de produtos imersivos, visualizações de dados espaciais, gêmeos digitais ou experiências de gamificação. O editor visual facilita o ajuste de cenas e câmeras, enquanto a API robusta permite interações programáticas profundas. Com ele, a fronteira entre o conteúdo web estático e experiências imersivas é quebrada, oferecendo um diferencial visual e funcional significativo para as aplicações.',
        color: getColor(),
        url: '/Threejs',
        name: 'Threejs',
        roles: ['MASTER'],
        icon: 'threejs',
        type: 'svg'
    },
    {
        shortDescription: 'Plataforma completa de educação corporativa. Crie cursos, distribua conteúdo e avalie o desempenho dos colaboradores para promover o crescimento contínuo.',
        description: 'O módulo Treinamento funciona como uma Universidade Corporativa digital (LMS). Ele permite a criação e gestão de catálogos de cursos, desde treinamentos de compliance obrigatórios até workshops de desenvolvimento de soft skills. Suportando vídeos, apresentações interativas e avaliações, o sistema gerencia matrículas, frequências e emissão de certificados automaticamente. Relatórios detalhados permitem ao RH medir o ROI dos treinamentos e identificar talentos internos. A plataforma promove uma cultura de aprendizado contínuo, garantindo que a força de trabalho esteja sempre atualizada com as melhores práticas de mercado e as inovações da empresa, aumentando a competitividade e a retenção de talentos.',
        color: getColor(),
        url: '/Treinamento',
        name: 'Treinamento',
        roles: ['MASTER'],
        icon: 'treinamento',
        type: 'svg'
    },
    {
        shortDescription: 'Acelere o ciclo de vendas e gerencie pedidos com eficiência. Do orçamento ao faturamento, tenha controle total sobre a performance comercial da sua equipe.',
        description: 'O módulo Vendas é o motor comercial da empresa, projetado para agilizar o fechamento de negócios. Ele permite a criação rápida de orçamentos, pedidos de venda e contratos, com cálculo automático de impostos e descontos baseados em regras pré-definidas. Integrado ao estoque e ao financeiro, garante que apenas produtos disponíveis sejam vendidos e que o faturamento ocorra sem atritos. O sistema oferece funis de vendas visuais para acompanhar oportunidades em cada estágio, além de relatórios de desempenho por vendedor, região ou produto. É a ferramenta essencial para transformar leads em clientes fiéis, maximizar a receita e dar visibilidade total sobre as metas comerciais.',
        color: getColor(),
        url: '/Vendas',
        name: 'Vendas',
        roles: ['MASTER'],
        icon: 'vendas',
        type: 'svg'
    },
    {
        shortDescription: 'Gerencie o relacionamento com seus clientes de forma estratégica. Histórico de interações, segmentação e ferramentas para fidelização em uma única plataforma.',
        description: 'O CRM (Customer Relationship Management) é focado em construir e manter relacionamentos duradouros com a base de clientes. Ele centraliza todo o histórico de interações — chamadas, emails, reuniões e compras passadas — proporcionando uma visão 360 graus de cada cliente. Ferramentas de segmentação permitem criar campanhas direcionadas e personalizadas. O sistema ajuda a identificar oportunidades de upsell e cross-sell, além de gerenciar casos de suporte e satisfação do cliente. Ao colocar o cliente no centro da operação, o CRM permite que as equipes de atendimento e vendas ofereçam um serviço proativo e de excelência, aumentando a lealdade e o valor vitalício (LTV) da carteira.',
        color: getColor(),
        url: '/CRM',
        name: 'CRM',
        roles: ['ADMIN'],
        icon: 'crm',
        type: 'svg'
    },
    {
        shortDescription: 'Gerencie todo o conteúdo digital da sua empresa. Publique artigos, páginas e mídias em seus canais web com facilidade, sem depender de desenvolvedores.',
        description: 'O CMS (Content Management System) oferece autonomia total para as equipes de marketing e comunicação gerenciarem os portais e sites da empresa. Com um editor visual rico (WYSIWYG), é possível criar, editar e publicar páginas, posts de blog e notícias em tempo real. O sistema gerencia o versionamento de conteúdo, fluxos de aprovação editorial e agendamento de publicações. Possui recursos robustos de gerenciamento de mídia (imagens e vídeos) e ferramentas de SEO on-page integradas. Flexível e escalável, o CMS permite manter a presença digital da marca sempre fresca e relevante, garantindo que a comunicação externa acompanhe a velocidade dos negócios sem gargalos técnicos.',
        color: getColor(),
        url: '/CMS',
        name: 'CMS',
        roles: ['MASTER'],
        icon: 'cms',
        type: 'svg'
    },
    {
        shortDescription: 'Loja de Aplicativos',
        description: 'Loja de Aplicativos',
        color: getColor(),
        url: '/Loja',
        name: 'Loja',
        roles: ['USER'],
        icon: 'apps',
        type: 'mat'
    },
];