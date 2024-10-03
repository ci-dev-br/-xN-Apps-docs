function getColor() {
    const hex = () => (13 + Math.floor(Math.random() * 3)).toString(16);
    return `#${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}`.toUpperCase()
}

export const APPS = [
    { color: getColor(), url: '/Arquivos', name: 'Arquivos', roles: ['USER', 'ADMIN', 'MASTER'], icon: 'files', type: 'svg' },
    { color: getColor(), url: '/Cadastros', name: 'Cadastros', roles: ['MASTER'], icon: 'cadastros', type: 'svg' },
    { color: getColor(), url: '/Codex', name: 'Codex', roles: ['MASTER'], icon: 'codex', type: 'svg' },
    { color: getColor(), url: '/DevTools', name: 'DevTools', roles: ['MASTER'], icon: 'dev-tools', type: 'svg' },
    { color: getColor(), url: '/Dynamic', name: 'Dynamic', roles: ['MASTER'], icon: 'dynamic', type: 'svg' },
    { color: getColor(), url: '/Financeiro', name: 'Financeiro', roles: ['MASTER'], icon: 'financeiro', type: 'svg' },
    { color: getColor(), url: '/Formularios', name: 'Formularios', roles: ['MASTER'], icon: 'formularios', type: 'svg' },
    { color: getColor(), url: '/Gerencial', name: 'Gerencial', roles: ['MASTER'], icon: 'gerencial', type: 'svg' },
    { color: getColor(), url: '/Icons', name: 'Icons', roles: ['MASTER'], icon: 'icones', type: 'svg' },
    { color: getColor(), url: '/Imersao', name: 'Imersao', roles: ['MASTER'], icon: 'imersao', type: 'svg' },
    { color: getColor(), url: '/Infra', name: 'Infra', roles: ['MASTER'], icon: 'infra', type: 'svg' },
    { color: getColor(), url: '/Instalacao', name: 'Instalacao', roles: ['MASTER'], icon: 'instalacao', type: 'svg' },
    { color: getColor(), url: '/LowCode', name: 'LowCode', roles: ['MASTER'], icon: 'low-code', type: 'svg' },
    { color: getColor(), url: '/Mensagens', name: 'Mensagens', roles: ['MASTER'], icon: 'mensagens', type: 'svg' },
    { color: getColor(), url: '/Organizacao', name: 'Organizacao', roles: ['MASTER'], icon: 'organizacao', type: 'svg' },
    { color: getColor(), url: '/Produtos', name: 'Produtos', roles: ['MASTER'], icon: 'produtos', type: 'svg' },
    { color: getColor(), url: '/Profile', name: 'Profile', roles: ['MASTER'], icon: 'perfil', type: 'svg' },
    { color: getColor(), url: '/Projetos', name: 'Projetos', roles: ['MASTER'], icon: 'projetos', type: 'svg' },
    { color: getColor(), url: '/SEO', name: 'SEO', roles: ['MASTER'], icon: 'seo', type: 'svg' },
    { color: getColor(), url: '/Threejs', name: 'Threejs', roles: ['MASTER'], icon: 'threejs', type: 'svg' },
    { color: getColor(), url: '/Treinamento', name: 'Treinamento', roles: ['MASTER'], icon: 'treinamento', type: 'svg' },
    { color: getColor(), url: '/Vendas', name: 'Vendas', roles: ['MASTER'], icon: 'vendas', type: 'svg' },
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