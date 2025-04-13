/* tslint:disable */
/* eslint-disable */
export interface IPayload {
  by?: string | null;
  data?: {
} | null;
  equals?: string | null;
  fields?: Array<string> | null;
}
export class Payload implements IPayload {
  static typeName = 'Payload';
  private _by?: string | null;
  public get by(): string | null| undefined{ return this._by; }
  public set by(value: string | null| undefined){
    if(this._by === value) return;
    this._by = value;
  }
  private _data?: {
} | null;
  public get data(): {
} | null| undefined{ return this._data; }
  public set data(value: {
} | null| undefined){
    if(this._data === value) return;
    this._data = value;
  }
  private _equals?: string | null;
  public get equals(): string | null| undefined{ return this._equals; }
  public set equals(value: string | null| undefined){
    if(this._equals === value) return;
    this._equals = value;
  }
  private _fields?: Array<string> | null;
  public get fields(): Array<string> | null| undefined{ return this._fields; }
  public set fields(value: Array<string> | null| undefined){
    if(this._fields === value) return;
    this._fields = value;
  }
  toJSON(): IPayload{
    return {
          by:this._by,
          data:this._data,
          equals:this._equals,
          fields:this._fields,
    }
  }
}
