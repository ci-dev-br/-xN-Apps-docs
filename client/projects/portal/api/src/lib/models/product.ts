/* tslint:disable */
/* eslint-disable */
import { Marca } from '../models/marca';
export interface IProduct {
  codigoBarras?: string | null;
  codigoFabricanete?: string | null;
  createdAt?: string | null;
  createdBy?: {
} | null;
  description?: string | null;
  gtin?: string | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: {
} | null;
  marca?: Marca | null;
  nossoCodigo?: string | null;
  shortDescription?: string | null;
  sku?: string | null;
  subGrupo?: string | null;
  tenants?: Array<string> | null;
  /**
   * URL do site
   */
  urlWebsiteOficial?: string | null;
}
export class Product implements IProduct {
  static typeName = 'Product';
  private _codigoBarras?: string | null;
  public get codigoBarras(): string | null| undefined{ return this._codigoBarras; }
  public set codigoBarras(value: string | null| undefined){
    if(this._codigoBarras === value) return;
    this._codigoBarras = value;
  }
  private _codigoFabricanete?: string | null;
  public get codigoFabricanete(): string | null| undefined{ return this._codigoFabricanete; }
  public set codigoFabricanete(value: string | null| undefined){
    if(this._codigoFabricanete === value) return;
    this._codigoFabricanete = value;
  }
  private _createdAt?: string | null;
  public get createdAt(): string | null| undefined{ return this._createdAt; }
  public set createdAt(value: string | null| undefined){
    if(this._createdAt === value) return;
    this._createdAt = value;
  }
  private _createdBy?: {
} | null;
  public get createdBy(): {
} | null| undefined{ return this._createdBy; }
  public set createdBy(value: {
} | null| undefined){
    if(this._createdBy === value) return;
    this._createdBy = value;
  }
  private _description?: string | null;
  public get description(): string | null| undefined{ return this._description; }
  public set description(value: string | null| undefined){
    if(this._description === value) return;
    this._description = value;
  }
  private _gtin?: string | null;
  public get gtin(): string | null| undefined{ return this._gtin; }
  public set gtin(value: string | null| undefined){
    if(this._gtin === value) return;
    this._gtin = value;
  }
  private _internalId?: string | null;
  public get internalId(): string | null| undefined{ return this._internalId; }
  public set internalId(value: string | null| undefined){
    if(this._internalId === value) return;
    this._internalId = value;
  }
  private _lastModifiedAt?: string | null;
  public get lastModifiedAt(): string | null| undefined{ return this._lastModifiedAt; }
  public set lastModifiedAt(value: string | null| undefined){
    if(this._lastModifiedAt === value) return;
    this._lastModifiedAt = value;
  }
  private _lastModifiedBy?: {
} | null;
  public get lastModifiedBy(): {
} | null| undefined{ return this._lastModifiedBy; }
  public set lastModifiedBy(value: {
} | null| undefined){
    if(this._lastModifiedBy === value) return;
    this._lastModifiedBy = value;
  }
  private _marca?: Marca | null;
  public get marca(): Marca | null| undefined{ return this._marca; }
  public set marca(value: Marca | null| undefined){
    if(this._marca === value) return;
    this._marca = value;
  }
  private _nossoCodigo?: string | null;
  public get nossoCodigo(): string | null| undefined{ return this._nossoCodigo; }
  public set nossoCodigo(value: string | null| undefined){
    if(this._nossoCodigo === value) return;
    this._nossoCodigo = value;
  }
  private _shortDescription?: string | null;
  public get shortDescription(): string | null| undefined{ return this._shortDescription; }
  public set shortDescription(value: string | null| undefined){
    if(this._shortDescription === value) return;
    this._shortDescription = value;
  }
  private _sku?: string | null;
  public get sku(): string | null| undefined{ return this._sku; }
  public set sku(value: string | null| undefined){
    if(this._sku === value) return;
    this._sku = value;
  }
  private _subGrupo?: string | null;
  public get subGrupo(): string | null| undefined{ return this._subGrupo; }
  public set subGrupo(value: string | null| undefined){
    if(this._subGrupo === value) return;
    this._subGrupo = value;
  }
  private _tenants?: Array<string> | null;
  public get tenants(): Array<string> | null| undefined{ return this._tenants; }
  public set tenants(value: Array<string> | null| undefined){
    if(this._tenants === value) return;
    this._tenants = value;
  }
  /**
   * URL do site
   */
  private _urlWebsiteOficial?: string | null;
  public get urlWebsiteOficial(): string | null| undefined{ return this._urlWebsiteOficial; }
  public set urlWebsiteOficial(value: string | null| undefined){
    if(this._urlWebsiteOficial === value) return;
    this._urlWebsiteOficial = value;
  }
  toJSON(): IProduct{
    return {
          codigoBarras:this._codigoBarras,
          codigoFabricanete:this._codigoFabricanete,
          createdAt:this._createdAt,
          createdBy:this._createdBy,
          description:this._description,
          gtin:this._gtin,
          internalId:this._internalId,
          lastModifiedAt:this._lastModifiedAt,
          lastModifiedBy:this._lastModifiedBy,
          marca:this._marca,
          nossoCodigo:this._nossoCodigo,
          shortDescription:this._shortDescription,
          sku:this._sku,
          subGrupo:this._subGrupo,
          tenants:this._tenants,
          urlWebsiteOficial:this._urlWebsiteOficial,
    }
  }
}
