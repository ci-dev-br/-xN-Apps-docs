/* tslint:disable */
/* eslint-disable */
export interface IPhotoGetPaylodInputDto {
  limit?: string | null;
  offset?: string | null;
  query?: string | null;
}

export class PhotoGetPaylodInputDto implements IPhotoGetPaylodInputDto {
  static typeName = 'PhotoGetPaylodInputDto';
  private _limit?: string | null;
  public get limit(): string | null| undefined{ return this._limit; }
  public set limit(value: string | null| undefined){
    if(this._limit === value) return;
    this._limit = value;
  }
  private _offset?: string | null;
  public get offset(): string | null| undefined{ return this._offset; }
  public set offset(value: string | null| undefined){
    if(this._offset === value) return;
    this._offset = value;
  }
  private _query?: string | null;
  public get query(): string | null| undefined{ return this._query; }
  public set query(value: string | null| undefined){
    if(this._query === value) return;
    this._query = value;
  }
  toJSON(): IPhotoGetPaylodInputDto{
    return {
          limit:this._limit,
          offset:this._offset,
          query:this._query,
    }
  }
}
