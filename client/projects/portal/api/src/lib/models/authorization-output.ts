/* tslint:disable */
/* eslint-disable */
export interface IAuthorizationOutput {
  authorization: string;
}
export class AuthorizationOutput implements IAuthorizationOutput {
  static typeName = 'AuthorizationOutput';
  private _authorization: string;
  public get authorization(): string{ return this._authorization; }
  public set authorization(value: string){
    if(this._authorization === value) return;
    this._authorization = value;
  }
  toJSON(): IAuthorizationOutput{
    return {
          authorization:this._authorization,
    }
  }
}
