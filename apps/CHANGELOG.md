# Changelogs
As mudanças devem estar descritas neste documento para melhor analisar a implementação com seu obejtivo a ser atingido. Descreva o que o recurso implementado resolve e o estágio em que ele se encontra para se comparado com os relatórios gerados após enviar se PR.
# Sprint Maio de 2025
- [>>>] Meus Documentos: Implementação de Meus Documentos;
- [ ] Launcher App: Para Mobile Managers e Afins;
  - [ ] Implementação de webview com carga do web.app;
  - [>] Implementação de Aplicação Launcher em web client restrito:
  apenas ao acesso via Aplicativo android de aplicação do tipo LAUNCHER;
- [>] Cadastros: 
    - [>>>] [TASK#1](./tasks/01.md) - Implementar edição e visualização de Cadastros utilizando DaoBuilder, seguindo exemplo de Implementação em Apps\Gerencial\Applications;
- [ ] - Implementação de Envio de SMS em MobMannager;
- [ ] - Implementação de Notification Bus:
    - [ ] - CLiente em Mobile Manager;
    - [ ] - Cliente em PWA;
    - [ ] - Serviço de Notificação e Event Bus na camada no do NestJS;
- [ ] - Implementar Serviço de Tema da aplicação:
    - [>] - Implementar LightMode e Dark Mode;
- [ ] - Profile: 
    - [ ] - Permitir adicionar foto de perfirl;
- [ ] - Implementação de Arquivos App:
    - [ ] - Home: Visão geral dos arquivos disponíveis ao acesso do usuário.
    - [ ] - Este PC: 'Permite compatilhar informações dos arquivos locais para serem compartilhados ou abertos com Apps especializados.
    - [ ] - REDE: Permitir ver os arquivos em rede de acordo com as Políticas de acesso do Usuário;
    - [ ] - Informações sobre espaço disponível para o usuário.
 - [ ] - Implementação de Cadastros App:
 - [ ] - Implementação de Codex App:
 - [ ] - Implementação de DevTools App:
 - [ ] - Implementação de Dynamic App:
 - [ ] - Implementação de Financeiro App:
 - [ ] - Implementação de Formularios App:
 - [ ] - Implementação de Gerencial App:
 - [ ] - Implementação de Icons App:
    [ ] - Importar aquivos de Ícones;
    [>] - Criar novo projeto de Ícone ou Fonte;
 - [ ] - Implementação de Imersao App:
 - [ ] - Implementação de Infra App:
 - [ ] - Implementação de Instalação App:
    - [ ] - Instalação de Novo App, permitir adicionar domínio, logo, e informações de hospedagem como DNS e arquivos da implantação.
 - [ ] - Implementação de LowCode App:
   - [ ] - CodeBlocks:
   - [ ] - NodeRED:
   - [ ] - Blocks Maker:
 - [ ] - Implementação de Mensagens App:
   - [ ] - Permitir adicionar usuários a partir do Messager ID. Que é único por usuário e pode ser gerado quanod o usuário quiser usar o Messager. Podendo gerar vários Messager ID para propósitos distintos.
   - [ ] - Vincular número de celular e contatos do dispositivo para identificar os usuáios de contato disponíveis ao Usuário.
   - [ ] - Abrir conversa com outro usuário e enviar conteúdo.
 - [ ] - Implementação de Organização App:
   - [ ] - Criar Organização e Viincular a um CNPJ ou CPF;
 - [ ] - Implementação de Produtos App:
   - [ ] - Consultar Estoque;
   - [ ] - Análise de estoque;
   - [ ] - Análise de Vendas;
 - [ ] - Implementação de Profile App:
   - [ ] - Alterar informações do Usuário;
   - [ ] - > Alterar foto de perfil: 
     - [ ] - > Carregar foto local; 
     - [ ] - Tirar foto; 
 - [ ] - Implementação de Projetos App:
   - [ ] - Criar novo Projeto para Acompanhamento;
 - [ ] - Implementação de SEO App:
   - [ ] -  Criar Documentação de SEO App
 - [ ] - Implementação de ThreeJS App:
   - [ ] - Importar projetos ThreeJS para dentro do App como novo App ou Projeto;
 - [ ] - Implementação de Treinamento App:
   - [ ] - Gerenciar Alunos;
   - [ ] - Gerenciar Turmas;
 - [ ] - Implementação de Vendas App:
   - [ ] - Criar nova meta de venda

# Sprint Abril de 2025
    [x] - Implementar Formulário com OpenAPI para construção dinâmica do formulário conforme modelo.
        [x] - Carga do Formulário de acordo com o nome do Schema;
        [x] - Implentação do DaoBuilder para construção de schemas para componentes;
    [x] - Implementação do componente Ícone `<ci-icon>;
    [x] - Correção em implementação de Identificação de Dispositivo em MobManager API v 19; 
# Sprint Março de 2025 
    [OK] - Refresh Token viinculado a chave de acesso;
        [ ] - Documentar Chave de Acesso;
    [x] - Profile: Implementações de Acesso e Segurança;

# Dezembro 2024

# Outubro 2024
    [x] - [#95][95] Ajustes em start da aplicação: gerar apis toda vez que a aplicação for iniciada.
    [x] - Implementação de Profile App:
         Alterar informações do usuário como nome de Usuário, nome e senha entre outros campos disponíveis.

# Anterior à Outubro de 2024:
    [x] - CORS dinâmico, solicitar autorização de CORS para novos domínios, gerar witelist de CORS com base em domínios confiáveis verificados;

--- 
[95]: https://dev.azure.com/cidevbr/Portal/_workitems/edit/95