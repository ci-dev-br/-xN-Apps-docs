/* tslint:disable */
/* eslint-disable */
export interface IGetByInternalIdInputDto {
  internalId?: string | null;
}
export class GetByInternalIdInputDto implements IGetByInternalIdInputDto {
  static typeName = 'GetByInternalIdInputDto';
  private _internalId?: string | null;
  public get internalId(): string | null| undefined{ return this._internalId; }
  public set internalId(value: string | null| undefined){
    if(this._internalId === value) return;
    this._internalId = value;
  }
  toJSON(): IGetByInternalIdInputDto{
    return {
          internalId:this._internalId,
    }
  }
}
