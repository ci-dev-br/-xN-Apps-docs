/* tslint:disable */
/* eslint-disable */
import { CatalogAppDto } from '../models/catalog-app-dto';
export interface ReconcileCatalogDto {

  /**
   * Lista completa de aplicações ativas no cliente
   */
  apps: Array<CatalogAppDto>;

  /**
   * Branch do Git
   */
  branch?: string;

  /**
   * Lista de colaboradores do repositório
   */
  collaborators?: Array<string>;

  /**
   * Hash da versão do cliente segundo o Git
   */
  versionHash: string;
}
