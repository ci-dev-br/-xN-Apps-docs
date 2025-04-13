/* tslint:disable */
/* eslint-disable */
import { Form } from '../models/form';
export interface ISyncPayloadDaoForm {
  data: Form;
}
export class SyncPayloadDaoForm implements ISyncPayloadDaoForm {
  static typeName = 'SyncPayloadDaoForm';
  private _data: Form;
  public get data(): Form{ return this._data; }
  public set data(value: Form){
    if(this._data === value) return;
    this._data = value;
  }
  toJSON(): ISyncPayloadDaoForm{
    return {
          data:this._data,
    }
  }
}
