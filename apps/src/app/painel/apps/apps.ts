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
    description?: string;
}
/**
 * Pre-loaded apps available in the painel
 */
export const APPS: IApp[] = [
    {
        categoria: 'System',
        description: 'Explorar arquivos do sistema.',
        color: getColor(),
        url: '/Arquivos',
        name: 'Arquivos',
        roles: ['ADMIN',
            'MASTER'],
        icon: 'files',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Cadastros',
        name: 'Cadastros',
        description: 'Gerenciar cadastros de clientes, fornecedores e parceiros.',
        roles: ['MASTER'],
        icon: 'cadastros',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Codex',
        name: 'Codex',
        description: 'Editor e Gerenciador de Código fonte.',
        roles: ['MASTER'],
        icon: 'codex',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/DevTools',
        name: 'DevTools',
        description: 'Ferramentas para desenvolvedores.',
        roles: ['MASTER'],
        icon: 'dev-tools',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Dynamic',
        name: 'Dynamic XD',
        description: 'Ferramenta de design e prototipação.',
        roles: ['MASTER'],
        icon: 'dynamic',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Financeiro',
        name: 'Financeiro',
        description: 'Gerenciar finanças e contabilidade.',
        roles: ['MASTER'],
        icon: 'financeiro',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Formularios',
        name: 'Formularios',
        description: 'Criar e gerenciar formulários personalizados.',
        roles: ['USER',
            'MASTER'],
        icon: 'formularios',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Gerencial',
        name: 'Gerencial',
        description: 'Painel de controle gerencial.',
        roles: ['MASTER'],
        icon: 'gerencial',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Icons',
        name: 'Icons',
        description: 'Biblioteca de ícones para projetos.',
        roles: ['MASTER'],
        icon: 'icones',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Imersao',
        name: 'Imersao',
        roles: ['MASTER'],
        icon: 'imersao',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Infra',
        name: 'Infra',
        description: 'Gerenciamento de infraestrutura de TI.',
        roles: ['MASTER'],
        icon: 'infra',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Instalacao',
        name: 'Instalacao',
        description: 'Gerenciar processos de instalação de Módulos e Funcionalidades.',
        roles: ['MASTER'],
        icon: 'instalacao',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/LowCode',
        name: 'LowCode',
        description: 'Plataforma de desenvolvimento Low-Code.',
        roles: ['MASTER'],
        icon: 'low-code',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Mensagens',
        name: 'Mensagens',
        roles: ['USER',
            'MASTER'],
        icon: 'mensagens',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Organizacao',
        name: 'Organizacao',
        roles: ['MASTER'],
        icon: 'organizacao',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Produtos',
        name: 'Produtos',
        roles: ['MASTER'],
        icon: 'produtos',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Profile',
        name: 'Profile',
        roles: ['MASTER'],
        icon: 'perfil',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Projetos',
        name: 'Projetos',
        roles: ['MASTER'],
        icon: 'projetos',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/SEO',
        name: 'SEO',
        roles: ['MASTER'],
        icon: 'seo',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Threejs',
        name: 'Threejs',
        roles: ['MASTER'],
        icon: 'threejs',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Treinamento',
        name: 'Treinamento',
        roles: ['MASTER'],
        icon: 'treinamento',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/Vendas',
        name: 'Vendas',
        roles: ['MASTER'],
        icon: 'vendas',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/CRM',
        name: 'CRM',
        roles: ['ADMIN'],
        icon: 'crm',
        type: 'svg'
    },
    {
        color: getColor(),
        url: '/CMS',
        name: 'CMS',
        roles: ['MASTER'],
        icon: 'cms',
        type: 'svg'
    },
];
/* 
agenda
anotacoes
cadastros
carteira
codex
dev
dynamic
estudos
files
financeiro
formularios
fotos
gerencial
icones
imersao
infra
instalacao
journal
low
mail
mensagens
organizacao
perfil
produtos
projetos
seo
threejs
tradutor
treinamento
vendas
*/