/* tslint:disable */
/* eslint-disable */
export interface IGetInputDtos {
  all?: boolean | null;
}
export class GetInputDtos implements IGetInputDtos {
  static typeName = 'GetInputDtos';
  private _all?: boolean | null;
  public get all(): boolean | null| undefined{ return this._all; }
  public set all(value: boolean | null| undefined){
    if(this._all === value) return;
    this._all = value;
  }
  toJSON(): IGetInputDtos{
    return {
          all:this._all,
    }
  }
}
