/* tslint:disable */
/* eslint-disable */
import { Pessoa } from '../models/pessoa';
export interface ISyncPayloadDaoPessoa {
  data: Pessoa;
}
export class SyncPayloadDaoPessoa implements ISyncPayloadDaoPessoa {
  static typeName = 'SyncPayloadDaoPessoa';
  private _data: Pessoa;
  public get data(): Pessoa{ return this._data; }
  public set data(value: Pessoa){
    if(this._data === value) return;
    this._data = value;
  }
  toJSON(): ISyncPayloadDaoPessoa{
    return {
          data:this._data,
    }
  }
}
