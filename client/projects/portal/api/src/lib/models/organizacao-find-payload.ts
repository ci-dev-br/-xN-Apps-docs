/* tslint:disable */
/* eslint-disable */
export interface IOrganizacaoFindPayload {
  query: string | null;
}
export class OrganizacaoFindPayload implements IOrganizacaoFindPayload {
  static typeName = 'OrganizacaoFindPayload';
  private _query: string | null;
  public get query(): string | null{ return this._query; }
  public set query(value: string | null){
    if(this._query === value) return;
    this._query = value;
  }
  toJSON(): IOrganizacaoFindPayload{
    return {
          query:this._query,
    }
  }
}
