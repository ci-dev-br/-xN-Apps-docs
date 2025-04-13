/* tslint:disable */
/* eslint-disable */
import { Pessoa } from '../models/pessoa';
import { Photo } from '../models/photo';
import { Tenant } from '../models/tenant';
export interface IOrganizacao {
  /**
   * Pessoa Responsável pelo cadastro da Organização na Plataforma virtual.
   */
  ''?: Pessoa | null;
  createdAt?: string | null;
  createdBy?: {
} | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: {
} | null;
  /**
   * Logomarca da Organização
   */
  logo?: Photo | null;
  /**
   * Nome da Organização
   */
  organizatioName?: string | null;
  tenant?: Tenant | null;
  tenants?: Array<string> | null;
}
export class Organizacao implements IOrganizacao {
  static typeName = 'Organizacao';
  /**
   * Pessoa Responsável pelo cadastro da Organização na Plataforma virtual.
   */
  private _''?: Pessoa | null;
  public get ''(): Pessoa | null| undefined{ return this._''; }
  public set ''(value: Pessoa | null| undefined){
    if(this._'' === value) return;
    this._'' = value;
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
  /**
   * Logomarca da Organização
   */
  private _logo?: Photo | null;
  public get logo(): Photo | null| undefined{ return this._logo; }
  public set logo(value: Photo | null| undefined){
    if(this._logo === value) return;
    this._logo = value;
  }
  /**
   * Nome da Organização
   */
  private _organizatioName?: string | null;
  public get organizatioName(): string | null| undefined{ return this._organizatioName; }
  public set organizatioName(value: string | null| undefined){
    if(this._organizatioName === value) return;
    this._organizatioName = value;
  }
  private _tenant?: Tenant | null;
  public get tenant(): Tenant | null| undefined{ return this._tenant; }
  public set tenant(value: Tenant | null| undefined){
    if(this._tenant === value) return;
    this._tenant = value;
  }
  private _tenants?: Array<string> | null;
  public get tenants(): Array<string> | null| undefined{ return this._tenants; }
  public set tenants(value: Array<string> | null| undefined){
    if(this._tenants === value) return;
    this._tenants = value;
  }
  toJSON(): IOrganizacao{
    return {
          '':this._'',
          createdAt:this._createdAt,
          createdBy:this._createdBy,
          internalId:this._internalId,
          lastModifiedAt:this._lastModifiedAt,
          lastModifiedBy:this._lastModifiedBy,
          logo:this._logo,
          organizatioName:this._organizatioName,
          tenant:this._tenant,
          tenants:this._tenants,
    }
  }
}
