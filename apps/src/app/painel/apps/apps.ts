function getColor() {
    const hex = () => (13 + Math.floor(Math.random() * 3)).toString(16);
    return `#${hex()}${hex()}${hex()}${hex()}${hex()}${hex()}`.toUpperCase()
}

export const APPS = [
    { color: getColor(), url: '/Arquivos', name: 'Arquivos', roles: ['MASTER'], icon: 'home_storage' },
    { color: getColor(), url: '/Cadastros', name: 'Cadastros', roles: ['MASTER'], icon: 'how_to_reg' },
    { color: getColor(), url: '/Codex', name: 'Codex', roles: ['MASTER'], icon: 'code' },
    { color: getColor(), url: '/DevTools', name: 'DevTools', roles: ['MASTER'], icon: 'handyman' },
    { color: getColor(), url: '/Dynamic', name: 'Dynamic', roles: ['MASTER'], icon: 'dynamic_form' },
    { color: getColor(), url: '/Financeiro', name: 'Financeiro', roles: ['MASTER'], icon: 'finance' },
    { color: getColor(), url: '/Formularios', name: 'Formularios', roles: ['MASTER'], icon: 'fact_check' },
    { color: getColor(), url: '/Gerencial', name: 'Gerencial', roles: ['MASTER'], icon: 'bookmark_manager' },
    { color: getColor(), url: '/Icons', name: 'Icons', roles: ['MASTER'], icon: 'add_reaction' },
    { color: getColor(), url: '/Imersao', name: 'Imersao', roles: ['MASTER'], icon: 'view_in_ar' },
    { color: getColor(), url: '/Infra', name: 'Infra', roles: ['MASTER'], icon: 'lan' },
    { color: getColor(), url: '/Instalacao', name: 'Instalacao', roles: ['MASTER'], icon: 'deployed_code' },
    { color: getColor(), url: '/LowCode', name: 'LowCode', roles: ['MASTER'], icon: 'variable_add' },
    { color: getColor(), url: '/Mensagens', name: 'Mensagens', roles: ['MASTER'], icon: 'chat' },
    { color: getColor(), url: '/Organizacao', name: 'Organizacao', roles: ['MASTER'], icon: 'corporate_fare' },
    { color: getColor(), url: '/Produtos', name: 'Produtos', roles: ['MASTER'], icon: 'inventory' },
    { color: getColor(), url: '/Profile', name: 'Profile', roles: ['MASTER'], icon: 'face' },
    { color: getColor(), url: '/Projetos', name: 'Projetos', roles: ['MASTER'], icon: 'tactic' },
    { color: getColor(), url: '/SEO', name: 'SEO', roles: ['MASTER'], icon: 'robot_2' },
    { color: getColor(), url: '/Threejs', name: 'Threejs', roles: ['MASTER'], icon: '3d_rotation' },
    { color: getColor(), url: '/Treinamento', name: 'Treinamento', roles: ['MASTER'], icon: 'school' },
    { color: getColor(), url: '/Vendas', name: 'Vendas', roles: ['MASTER'], icon: 'store' },
];