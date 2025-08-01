/* tslint:disable */
/* eslint-disable */
import { TipoDocumentoIdentificacao } from '../models/tipo-documento-identificacao';
export interface IDocumentoIdentificacao {
  createdAt?: string | null;
  createdBy?: {
} | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: {
} | null;
  numeroDocumento?: string | null;
  pessoa?: {
} | null;
  tenants?: Array<string> | null;
  tipo?: TipoDocumentoIdentificacao | null;
}
export class DocumentoIdentificacao implements IDocumentoIdentificacao {
  static typeName = 'DocumentoIdentificacao';
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
  private _numeroDocumento?: string | null;
  public get numeroDocumento(): string | null| undefined{ return this._numeroDocumento; }
  public set numeroDocumento(value: string | null| undefined){
    if(this._numeroDocumento === value) return;
    this._numeroDocumento = value;
  }
  private _pessoa?: {
} | null;
  public get pessoa(): {
} | null| undefined{ return this._pessoa; }
  public set pessoa(value: {
} | null| undefined){
    if(this._pessoa === value) return;
    this._pessoa = value;
  }
  private _tenants?: Array<string> | null;
  public get tenants(): Array<string> | null| undefined{ return this._tenants; }
  public set tenants(value: Array<string> | null| undefined){
    if(this._tenants === value) return;
    this._tenants = value;
  }
  private _tipo?: TipoDocumentoIdentificacao | null;
  public get tipo(): TipoDocumentoIdentificacao | null| undefined{ return this._tipo; }
  public set tipo(value: TipoDocumentoIdentificacao | null| undefined){
    if(this._tipo === value) return;
    this._tipo = value;
  }
  toJSON(): IDocumentoIdentificacao{
    return {
          createdAt:this._createdAt,
          createdBy:this._createdBy,
          internalId:this._internalId,
          lastModifiedAt:this._lastModifiedAt,
          lastModifiedBy:this._lastModifiedBy,
          numeroDocumento:this._numeroDocumento,
          pessoa:this._pessoa,
          tenants:this._tenants,
          tipo:this._tipo,
    }
  }
}
