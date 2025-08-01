/* tslint:disable */
/* eslint-disable */
export interface IObterListaPessoa {
  skip: number;
  take: number;
  where: {
};
}
export class ObterListaPessoa implements IObterListaPessoa {
  static typeName = 'ObterListaPessoa';
  private _skip: number;
  public get skip(): number{ return this._skip; }
  public set skip(value: number){
    if(this._skip === value) return;
    this._skip = value;
  }
  private _take: number;
  public get take(): number{ return this._take; }
  public set take(value: number){
    if(this._take === value) return;
    this._take = value;
  }
  private _where: {
};
  public get where(): {
}{ return this._where; }
  public set where(value: {
}){
    if(this._where === value) return;
    this._where = value;
  }
  toJSON(): IObterListaPessoa{
    return {
          skip:this._skip,
          take:this._take,
          where:this._where,
    }
  }
}
