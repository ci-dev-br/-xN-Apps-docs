/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { IconPack } from '../models/icon-pack';
export interface Icon {

  /**
   * Caminho relativo nos assets públicos (ex: icons/v2/codex.svg).
   */
  assetPath?: string | null;

  /**
   * Categoria visual do ícone (App, Ação, Sistema, Navegação, UI).
   */
  category?: string | null;

  /**
   * Identificador único do ícone (usado em mat-icon [svgIcon] e no iconLoader).
   */
  code: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Descrição semântica e orientações de uso do ícone.
   */
  description?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Identificadores das ações da interface que utilizam este ícone.
   */
  linkedActions?: Array<string> | null;

  /**
   * Chaves dos aplicativos que utilizam este ícone.
   */
  linkedApps?: Array<string> | null;

  /**
   * Nome legível do ícone.
   */
  name?: string | null;

  /**
   * Pacote de ícones associado.
   */
  pack?: IconPack | null;

  /**
   * Código do pacote ao qual o ícone pertence (ex: v2, v3, default).
   */
  packCode?: string | null;

  /**
   * Markup XML/SVG sanitizado do ícone.
   */
  svgContent?: string | null;

  /**
   * Palavras-chave de pesquisa do ícone.
   */
  tags?: Array<string> | null;
  tenants?: Array<string> | null;

  /**
   * Finalidade principal: app, action, both ou ui.
   */
  usageType?: string | null;

  /**
   * Atributo viewBox do SVG (ex: 0 0 160 160 ou 0 0 24 24).
   */
  viewBox?: string | null;
}
