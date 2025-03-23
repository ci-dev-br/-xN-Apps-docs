/* tslint:disable */
/* eslint-disable */
export interface IPolicy {
  code: string;
  description?: string | null;
}

export class Policy implements IPolicy {
  static typeName = 'Policy';
  private _code: string;
  public get code(): string{ return this._code; }
  public set code(value: string){
    if(this._code === value) return;
    this._code = value;
  }
  private _description?: string | null;
  public get description(): string | null| undefined{ return this._description; }
  public set description(value: string | null| undefined){
    if(this._description === value) return;
    this._description = value;
  }
  toJSON(): IPolicy{
    return {
          code:this._code,
          description:this._description,
    }
  }
}
