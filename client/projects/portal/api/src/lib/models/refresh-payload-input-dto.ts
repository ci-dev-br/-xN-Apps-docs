/* tslint:disable */
/* eslint-disable */
export interface IRefreshPayloadInputDto {
  refreshToken: string;
}

export class RefreshPayloadInputDto implements IRefreshPayloadInputDto {
  static typeName = 'RefreshPayloadInputDto';
  private _refreshToken: string;
  public get refreshToken(): string{ return this._refreshToken; }
  public set refreshToken(value: string){
    if(this._refreshToken === value) return;
    this._refreshToken = value;
  }
  toJSON(): IRefreshPayloadInputDto{
    return {
          refreshToken:this._refreshToken,
    }
  }
}
