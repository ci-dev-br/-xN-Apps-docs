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
   * A categoria à qual a aplicação pertence. Isso ajuda na organização e filtragem das aplicações.
   */
  categoria?: string | null;

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
   * O nome da aplicação. Este nome é exibido aos usuários e é usado para identificação.
   */
  name?: string | null;

  /**
   * Usuários com permissão de alteração no código fonte do sistema de forma direta inretristiva.
   */
  responsibility?: Array<User> | null;
  roles?: Array<string> | null;

  /**
   * O endereço URL principal da aplicação. Este é o ponto de acesso externo para a aplicação.
   */
  url?: string | null;

  /**
   * Os usuários da aplicação são aqueles que fizeram registro ou possuem licensa de uso da aplicação. Algumas aplicações podem exigir licença para uso de módulos específicos.
   */
  users?: Array<User> | null;
}
