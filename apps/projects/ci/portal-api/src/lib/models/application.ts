/* tslint:disable */
/* eslint-disable */
import { Domain } from '../models/domain';
import { User } from '../models/user';
export interface Application {

  /**
   * Usuáriso administradores são responsáveis pelo gerenciamento de acesso dos usuários aos dados gerados pelo sistema.
   */
  administrators?: Array<User> | null;
  categoria?: string | null;
  description?: string | null;
  domain?: Domain | null;

  /**
   * Adicione os domínios que podem responder por esta aplicação.
   */
  domains?: Array<Domain> | null;
  icon?: string | null;
  id?: string | null;

  /**
   * Logo da aplicação
   */
  logo?: string | null;
  menuGroupName?: string | null;
  name?: string | null;
  roles?: Array<string> | null;
  url?: string | null;

  /**
   * Os usuários da aplicação são aqueles que fizeram registro ou possuem licensa de uso da aplicação. Algumas aplicações podem exigir licença para uso de módulos específicos.
   */
  users?: Array<User> | null;
}
