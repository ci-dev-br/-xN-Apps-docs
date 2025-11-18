# Especificação de Requisitos de Software (SRS)

Projeto: Module Loader Management System (MLMS)
Versão: 1.0 Framework Base: NestJS Plataformas: Windows / Linux
---

1. Visão Geral e Objetivos
O MLMS é um sistema distribuído focado na orquestração, compilação e carregamento dinâmico de módulos de software. O sistema opera sob uma arquitetura orientada a eventos, onde "Nós" (Nodes) autônomos escutam, processam e publicam recursos baseados em definições de código-fonte e ambientes de compilação.

O objetivo da Versão 1 é estabelecer a comunicação entre nós, o pipeline de obtenção de código (Source Fetching), a compilação segura e a notificação de disponibilidade do recurso.

2. Arquitetura do Sistema
O sistema será composto por dois tipos principais de atores lógicos (que podem residir na mesma instância ou distribuídos):

Module Orchestrator (Gerenciador): Responsável por emitir ordens de carga, gerenciar o registro de nós e manter o catálogo de recursos disponíveis.

Worker Nodes (Nós de Execução): Responsáveis por "levantar a mão" para executar uma tarefa, baixar o código, compilar e disponibilizar o artefato final.

Fluxo de Dados: Evento de Solicitação -> Barramento de Eventos -> Nó Capaz -> Compilação -> Evento de Publicação

3. Stack Tecnológica
Core: NestJS (Node.js).

Comunicação (Event Layer):

Interna: @nestjs/event-emitter (para eventos dentro da mesma instância).

Distribuída: @nestjs/microservices (Redis, MQTT ou NATS recomendado para propagação entre nós).

Compilação: child_process (execução de scripts de build) ou Integração com Docker (opcional para v1, recomendado para isolamento).

Sistema de Arquivos: Abstração compatível com caminhos Windows (\) e Linux (/).

4. Requisitos Funcionais (Features V1)
4.1. Gestão de Nós (Node Discovery)
O sistema deve permitir que novas instâncias se registrem na rede e informem suas capacidades (ex: "Tenho compilador Java", "Tenho Node v20", "Sou Windows").

RF001 - Handshake de Conexão: Ao iniciar, um nó deve enviar um evento de node.connected contendo seu ID, OS e Capabilities.

RF002 - Health Check: O Gerenciador deve saber quais nós estão ativos através de um mecanismo de heartbeat.

4.2. Definição e Solicitação de Módulo
O sistema deve padronizar como um módulo é solicitado.

RF003 - Estrutura de Manifesto: Criação de um DTO padrão (LoadRequestDto) contendo:

sourceUrl: (Git URL ou Path local).

compilerStrategy: (Ex: 'npm-build', 'maven', 'raw-script').

version: Tag ou hash do commit.

targetEnvironment: Requisitos do sistema (ex: 'linux').

4.3. Camada de Eventos (Event Layer)
O coração do sistema. Deve propagar ações sem acoplamento direto.

RF004 - Propagação de Eventos: Implementar um Event Bus global.

module.load.requested: Disparado quando um recurso é necessário.

module.processing.started: Um nó aceitou a tarefa (Lock).

module.compiled.success: Artefato pronto para uso.

module.compiled.error: Falha na compilação.

4.4. Pipeline de Compilação (The "Machine")
A lógica onde o nó transforma código fonte em recurso executável.

RF005 - Fetcher Service: Serviço capaz de clonar repositórios Git ou copiar pastas locais para uma área de staging temporária.

RF006 - Compiler Runner: Um serviço que executa comandos de terminal baseados no SO do nó.

Windows: Executa via Powershell/CMD.

Linux: Executa via Bash.

RF007 - Isolamento de Build: Cada compilação deve ocorrer em uma pasta única (UUID) para evitar conflitos de arquivos.

4.5. Publicação e Carregamento
RF008 - Artifact Storage: Após a compilação, o nó deve mover o resultado (ex: pasta dist/ ou arquivo .jar) para um diretório público ou fazer upload para um Storage (S3/MinIO - Local File System para v1).

RF009 - Dynamic Import (Opcional v1): Se o módulo for JavaScript/Node, o sistema deve tentar realizar um import() dinâmico do caminho gerado para validar a integridade.

5. Modelo de Dados (Draft das Interfaces)
Abaixo, um esboço das interfaces TypeScript para guiar o desenvolvimento no NestJS.

TypeScript

// Definição de um Nó na rede
export interface WorkerNode {
  nodeId: string;
  platform: 'win32' | 'linux' | 'darwin';
  capabilities: string[]; // ['node:20', 'python:3.11', 'compiler:gcc']
  status: 'IDLE' | 'BUSY';
}

// Solicitação de Carregamento/Compilação
export interface ModuleLoadRequest {
  requestId: string;
  moduleName: string;
  source: {
    type: 'git' | 'local';
    url: string;
    branchOrTag?: string;
  };
  buildConfig: {
    command: string; // Ex: "npm install && npm run build"
    outputDir: string; // Ex: "dist/main.js"
  };
}

// Evento de Recurso Disponível
export interface ModuleReadyEvent {
  requestId: string;
  nodeId: string;
  artifactPath: string; // Caminho absoluto ou URL http onde o recurso está
  entryPoint: string;
  timestamp: Date;
}
6. Diagrama de Sequência (Lógico)
Snippet de código

sequenceDiagram
    participant Client
    participant EventBus
    participant Manager
    participant NodeWindows
    participant NodeLinux

    Client->>Manager: Solicita Módulo "Relatorios" (req: Linux)
    Manager->>EventBus: Emit "module.load.requested"
    
    NodeWindows->>EventBus: Ignora (Incompatível)
    NodeLinux->>EventBus: Escuta e Aceita
    
    NodeLinux->>EventBus: Emit "module.processing.started" (Lock)
    NodeLinux->>NodeLinux: Git Clone -> Build (npm run build)
    
    alt Sucesso
        NodeLinux->>EventBus: Emit "module.compiled.success"
        Manager->>Client: Módulo disponível em [Path/URL]
    else Falha
        NodeLinux->>EventBus: Emit "module.compiled.error"
    end
7. Próximos Passos para Implementação
Para iniciar o desenvolvimento desta especificação (V1):

Setup Inicial: Criar um monorepo NestJS contendo duas aplicações: orchestrator e worker-node.

Camada de Transporte: Configurar o Redis (via Docker) para servir como a camada de transporte do Microservice do NestJS.

Protótipo do Runner: Criar um Service simples no worker-node que recebe uma string de comando (ex: echo "Hello World") e a executa usando child_process.exec, retornando o stdout via evento.

Gostaria que eu gerasse o código inicial (scaffold) do módulo worker-node com a implementação do Executor de Comandos (RF006)?