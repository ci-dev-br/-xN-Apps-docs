/* tslint:disable */
/* eslint-disable */
import { Domain } from '../models/domain';
import { User } from '../models/user';
export interface Application {

  /**
   * Usuáriso administradores são responsáveis pelo gerenciamento de acesso dos usuários aos dados gerados pelo sistema.
   */
  administrators?: Array<User> | null;

  /**
   * Lista de IDs de tenants com permissão para carregar esta aplicação. Se vazio ou nulo, liberado a todos.
   */
  allowedTenantIds?: Array<string> | null;

  /**
   * Chave única associada à rota da aplicação no cliente (ex: Mensagens, Arquivos, Cadastros).
   */
  appKey?: string | null;

  /**
   * Lista de autores que realizaram commits dentro da pasta da aplicação.
   */
  authors?: Array<string> | null;

  /**
   * A categoria à qual a aplicação pertence. Isso ajuda na organização e filtragem das aplicações.
   */
  categoria?: string | null;

  /**
   * Lista de co-autores identificados nas mensagens dos commits da pasta da aplicação.
   */
  coAuthors?: Array<string> | null;

  /**
   * Lista de desenvolvedores e colaboradores do repositório/aplicação.
   */
  collaborators?: Array<string> | null;

  /**
   * Total de commits registrados para a pasta desta aplicação.
   */
  commitCount?: number | null;

  /**
   * Regras e metadados contextuais (ex: versão mínima, recursos exigidos, restrições de planos).
   */
  contextPolicies?: {
} | null;

  /**
   * A descrição detalhada da aplicação.
   */
  description?: string | null;
  domain?: Domain | null;

  /**
   * Adicione os domínios que podem responder por esta aplicação.
   */
  domains?: Array<Domain> | null;

  /**
   * Data e hora da primeira execução/catalogação da aplicação.
   */
  firstSeenAt?: string | null;

  /**
   * Localização da pasta do repositório onde reside o código da aplicação.
   */
  folderPath?: string | null;

  /**
   * Hash do commit Git originário da última execução ou catalogação da aplicação.
   */
  gitVersionHash?: string | null;

  /**
   * Usuário responsável pelo hosteamento da aplicação.
   */
  hoster?: User | null;

  /**
   * Ícone da aplicação
   */
  icon?: string | null;

  /**
   * ID interno da aplicação. Este ID é gerado automaticamente e é usado para identificar a aplicação de forma única no sistema.
   */
  id?: string | null;

  /**
   * Determina se a aplicação está ativa e disponível para carregamento na plataforma.
   */
  isActive?: boolean | null;

  /**
   * Quando verdadeiro, impede que a catalogação automática sobrescreva customizações manuais feitas por administradores.
   */
  isCatalogLocked?: boolean | null;

  /**
   * Data do último commit registrado na pasta da aplicação.
   */
  lastCommitDate?: string | null;

  /**
   * Data e hora da última requisição assinada ou execução detectada.
   */
  lastSeenAt?: string | null;

  /**
   * Logo da aplicação
   */
  logo?: string | null;

  /**
   * Usuários com permissão de gestão dos  dados gerados pelos sistema, pemitindo vetação ou ajuste manual, dentre duas permissões e acessos específicos, permissivos ou restritivos.
   */
  managers?: Array<User> | null;

  /**
   * Usuários que podem administrar as permissões de acessos da aplicação.
   */
  masters?: Array<User> | null;
  menuGroupName?: string | null;

  /**
   * Lista de módulos ou aplicações padrão contidos e combinados nesta aplicação.
   */
  modules?: (Array<'CRM' | 'Cadastros' | 'Financeiro' | 'Vendas' | 'Produtos' | 'Mensagens' | 'Organizacao' | 'Projetos' | 'Arquivos' | 'Formularios' | 'CMS' | 'LowCode' | 'Dynamic' | 'Treinamento' | 'DevTools' | 'Codex' | 'SEO' | 'Threejs' | 'Grupos'>) | null;

  /**
   * O nome da aplicação. Este nome é exibido aos usuários e é usado para identificação.
   */
  name?: string | null;

  /**
   * Usuários com permissão de alteração no código fonte do sistema de forma direta inretristiva.
   */
  responsibility?: Array<User> | null;
  roles?: Array<string> | null;

  /**
   * Caminho da rota registrado no painel do cliente (ex: /Mensagens, /Arquivos).
   */
  routePath?: string | null;

  /**
   * O endereço URL principal da aplicação. Este é o ponto de acesso externo para a aplicação.
   */
  url?: string | null;

  /**
   * Os usuários da aplicação são aqueles que fizeram registro ou possuem licença de uso da aplicação. Algumas aplicações podem exigir licença para uso de módulos específicos.
   */
  users?: Array<User> | null;
}
