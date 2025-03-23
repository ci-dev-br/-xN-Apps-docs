/* tslint:disable */
/* eslint-disable */
import { Product } from '../models/product';
export interface ISyncPayloadDaoProduct {
  data: Product;
}

export class SyncPayloadDaoProduct implements ISyncPayloadDaoProduct {
  static typeName = 'SyncPayloadDaoProduct';
  private _data: Product;
  public get data(): Product{ return this._data; }
  public set data(value: Product){
    if(this._data === value) return;
    this._data = value;
  }
  toJSON(): ISyncPayloadDaoProduct{
    return {
          data:this._data,
    }
  }
}
