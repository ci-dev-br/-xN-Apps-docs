# Análise de Changelog e Backlog Priorizado

**Legenda de Status:**
- [x] Concluído
- [/] Parcial / Em Andamento
- [ ] Não Iniciado

---

### 1. Passado (Realizado)
*Fundação da plataforma, infraestrutura, segurança e componentes essenciais já entregues.*

- [x] **Infraestrutura / Core:** CORS dinâmico e whitelist; Geração automática de APIs no start da aplicação.
- [x] **Segurança:** Refresh Token vinculado à chave de acesso; Implementações de Acesso e Segurança no Profile.
- [x] **Integração / API:** Correção de Identificação de Dispositivo em MobManager API v19.
- [x] **Notificações:** Notification Bus completo (NestJS, PWA, Mobile Manager, Auto-reconnect).
- [x] **Componentes UI:** Implementação de `<ci-icon>`; Formulário com OpenAPI (Carga de Schema e DaoBuilder); Master Detail (Correção de duplicação sem internalId).
- [x] **Apps:** Launcher App (Webview com carga do web.app); Gerencial App; Profile App (Alterar informações do Usuário).

---

### 2. Presente (Em Andamento / Parcial)
*Recursos iniciados que exigem refinamento ou conclusão de sub-tarefas para atingirem o status de finalizado.*

- [/] **Launcher / Mobile:** Launcher App restrito via aplicativo Android; Envio de SMS em MobManager (Funciona Parcialmente).
- [/] **Cadastros / Dados:** Edição e visualização de Cadastros utilizando DaoBuilder (TASK#1).
- [/] **Interface / UX:** Serviço de Tema (LightMode e Dark Mode); Meus Documentos.
- [/] **Profile:** Upload e configuração de Foto de Perfil.
- [/] **Ecossistema de Apps (Iniciados):** Codex App, DevTools App, Dynamic App, Financeiro App, Formulários App, Icons App (Novo projeto de Ícone/Fonte), LowCode App (CodeBlocks, NodeRED), Mensagens App, Organização App, Treinamento App.
 - [ ] **Publicação**: Hook para catálogo e publicação das distribuições realizadas pelo CI/CD;

---

### 3. Futuro (A Fazer)
*Backlog bruto de itens planejados que ainda não tiveram seu desenvolvimento iniciado.*

- [ ] **CRM / Interface:** Melhorias no MasterDetail (Layout, campos @Ref, pesquisa básica, sub-ações); Pesquisa de itens na visão geral; Abertura de objetos em janelas externas.
- [ ] **Interação Social:** Feed na página inicial (Publicar texto, citação, foto, vídeo).
- [ ] **Arquivos App:** Visão Home, "Este PC", arquivos em REDE, e painel de informações de espaço disponível.
- [ ] **Mensagens App:** Adição via Massager ID, vínculo de contatos do dispositivo, abertura de conversas.
- [ ] **Agenda / Calendário:** Controle de eventos por usuário e registro de entidades de evento.
- [ ] **Novos Apps e Módulos:** Desenvolvimento integral ou expansão dos apps: Cadastros, Infra, Instalação, Produtos (Estoque e Vendas), Projetos, SEO, e ThreeJS.

---

### Estratégia de Execução: Próxima Semana (Backlog Priorizado)
*Foco na consolidação de pendências para garantir estabilidade do core e da interface mobile antes de assumir novos escopos.*

#### Prioridade 1: Estabilidade Core e Mobile (Desbloqueio)
- [/] **Envio de SMS em MobManager:** Investigar e corrigir o funcionamento parcial para garantir estabilidade na comunicação.
- [/] **Launcher App (Web Client Restrito):** Finalizar a trava de segurança para acesso exclusivo via app Android.
- [/] **Cadastros (TASK#1):** Concluir a edição e visualização usando DaoBuilder para destravar a criação de formulários.

#### Prioridade 2: Usabilidade e Componentes Globais (Percepção de Valor)
- [ ] **Melhoria MasterDetail em CRM:** Ajustar layout interno (quebra centralizada) e implementar pesquisa básica nos campos `@Ref()`.
- [/] **Serviço de Temas:** Concluir implementação limpa do Light Mode e Dark Mode.
- [/] **Profile (Foto de Perfil):** Finalizar fluxo de alteração de foto (carregar local e tirar foto).

#### Prioridade 3: Quick Wins e Preparação de Terreno
- [ ] **Janela Externa:** Implementar a abertura de objetos a partir do `internalId`.
- [/] **Organização App:** Entregar a criação básica de Organização vinculada a um CNPJ/CPF.