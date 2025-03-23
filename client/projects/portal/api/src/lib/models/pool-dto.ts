/* tslint:disable */
/* eslint-disable */
export interface IPoolDto {
  messages: Array<Array<any>>;
}

export class PoolDto implements IPoolDto {
  static typeName = 'PoolDto';
  private _messages: Array<Array<any>>;
  public get messages(): Array<Array<any>>{ return this._messages; }
  public set messages(value: Array<Array<any>>){
    if(this._messages === value) return;
    this._messages = value;
  }
  toJSON(): IPoolDto{
    return {
          messages:this._messages,
    }
  }
}
