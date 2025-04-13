/* tslint:disable */
/* eslint-disable */
export interface IProductCotrollerGetInputDto {
  orderBy?: {
} | null;
  skip?: number | null;
  take?: number | null;
  where?: {
} | null;
}
export class ProductCotrollerGetInputDto implements IProductCotrollerGetInputDto {
  static typeName = 'ProductCotrollerGetInputDto';
  private _orderBy?: {
} | null;
  public get orderBy(): {
} | null| undefined{ return this._orderBy; }
  public set orderBy(value: {
} | null| undefined){
    if(this._orderBy === value) return;
    this._orderBy = value;
  }
  private _skip?: number | null;
  public get skip(): number | null| undefined{ return this._skip; }
  public set skip(value: number | null| undefined){
    if(this._skip === value) return;
    this._skip = value;
  }
  private _take?: number | null;
  public get take(): number | null| undefined{ return this._take; }
  public set take(value: number | null| undefined){
    if(this._take === value) return;
    this._take = value;
  }
  private _where?: {
} | null;
  public get where(): {
} | null| undefined{ return this._where; }
  public set where(value: {
} | null| undefined){
    if(this._where === value) return;
    this._where = value;
  }
  toJSON(): IProductCotrollerGetInputDto{
    return {
          orderBy:this._orderBy,
          skip:this._skip,
          take:this._take,
          where:this._where,
    }
  }
}
