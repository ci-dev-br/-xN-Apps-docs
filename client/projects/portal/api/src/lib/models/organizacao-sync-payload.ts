/* tslint:disable */
/* eslint-disable */
import { Organizacao } from '../models/organizacao';
export interface IOrganizacaoSyncPayload {
  data: Organizacao;
}
export class OrganizacaoSyncPayload implements IOrganizacaoSyncPayload {
  static typeName = 'OrganizacaoSyncPayload';
  private _data: Organizacao;
  public get data(): Organizacao{ return this._data; }
  public set data(value: Organizacao){
    if(this._data === value) return;
    this._data = value;
  }
  toJSON(): IOrganizacaoSyncPayload{
    return {
          data:this._data,
    }
  }
}
