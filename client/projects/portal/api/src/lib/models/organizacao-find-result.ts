/* tslint:disable */
/* eslint-disable */
import { Organizacao } from '../models/organizacao';
export interface IOrganizacaoFindResult {
  '0': Array<Organizacao> | null;
  '1': number | null;
}

export class OrganizacaoFindResult implements IOrganizacaoFindResult {
  static typeName = 'OrganizacaoFindResult';
  private _'0': Array<Organizacao> | null;
  public get '0'(): Array<Organizacao> | null{ return this._'0'; }
  public set '0'(value: Array<Organizacao> | null){
    if(this._'0' === value) return;
    this._'0' = value;
  }
  private _'1': number | null;
  public get '1'(): number | null{ return this._'1'; }
  public set '1'(value: number | null){
    if(this._'1' === value) return;
    this._'1' = value;
  }
  toJSON(): IOrganizacaoFindResult{
    return {
          '0':this._'0',
          '1':this._'1',
    }
  }
}
