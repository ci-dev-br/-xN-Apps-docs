/* tslint:disable */
/* eslint-disable */
export interface IPartPayloadDto {
  TotalParts?: number | null;
  currentPart?: number | null;
  md5Full?: string | null;
  md5Part?: string | null;
  partialBase64?: string | null;
}

export class PartPayloadDto implements IPartPayloadDto {
  static typeName = 'PartPayloadDto';
  private _TotalParts?: number | null;
  public get TotalParts(): number | null| undefined{ return this._TotalParts; }
  public set TotalParts(value: number | null| undefined){
    if(this._TotalParts === value) return;
    this._TotalParts = value;
  }
  private _currentPart?: number | null;
  public get currentPart(): number | null| undefined{ return this._currentPart; }
  public set currentPart(value: number | null| undefined){
    if(this._currentPart === value) return;
    this._currentPart = value;
  }
  private _md5Full?: string | null;
  public get md5Full(): string | null| undefined{ return this._md5Full; }
  public set md5Full(value: string | null| undefined){
    if(this._md5Full === value) return;
    this._md5Full = value;
  }
  private _md5Part?: string | null;
  public get md5Part(): string | null| undefined{ return this._md5Part; }
  public set md5Part(value: string | null| undefined){
    if(this._md5Part === value) return;
    this._md5Part = value;
  }
  private _partialBase64?: string | null;
  public get partialBase64(): string | null| undefined{ return this._partialBase64; }
  public set partialBase64(value: string | null| undefined){
    if(this._partialBase64 === value) return;
    this._partialBase64 = value;
  }
  toJSON(): IPartPayloadDto{
    return {
          TotalParts:this._TotalParts,
          currentPart:this._currentPart,
          md5Full:this._md5Full,
          md5Part:this._md5Part,
          partialBase64:this._partialBase64,
    }
  }
}
