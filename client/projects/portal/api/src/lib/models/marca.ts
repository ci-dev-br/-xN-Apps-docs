/* tslint:disable */
/* eslint-disable */
export interface IMarca {
  code?: string | null;
  createdAt?: string | null;
  createdBy?: {
} | null;
  description?: string | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: {
} | null;
  name?: string | null;
  siteUrl?: string | null;
  tenants?: Array<string> | null;
}

export class Marca implements IMarca {
  static typeName = 'Marca';
  private _code?: string | null;
  public get code(): string | null| undefined{ return this._code; }
  public set code(value: string | null| undefined){
    if(this._code === value) return;
    this._code = value;
  }
  private _createdAt?: string | null;
  public get createdAt(): string | null| undefined{ return this._createdAt; }
  public set createdAt(value: string | null| undefined){
    if(this._createdAt === value) return;
    this._createdAt = value;
  }
  private _createdBy?: {
} | null;
  public get createdBy(): {
} | null| undefined{ return this._createdBy; }
  public set createdBy(value: {
} | null| undefined){
    if(this._createdBy === value) return;
    this._createdBy = value;
  }
  private _description?: string | null;
  public get description(): string | null| undefined{ return this._description; }
  public set description(value: string | null| undefined){
    if(this._description === value) return;
    this._description = value;
  }
  private _internalId?: string | null;
  public get internalId(): string | null| undefined{ return this._internalId; }
  public set internalId(value: string | null| undefined){
    if(this._internalId === value) return;
    this._internalId = value;
  }
  private _lastModifiedAt?: string | null;
  public get lastModifiedAt(): string | null| undefined{ return this._lastModifiedAt; }
  public set lastModifiedAt(value: string | null| undefined){
    if(this._lastModifiedAt === value) return;
    this._lastModifiedAt = value;
  }
  private _lastModifiedBy?: {
} | null;
  public get lastModifiedBy(): {
} | null| undefined{ return this._lastModifiedBy; }
  public set lastModifiedBy(value: {
} | null| undefined){
    if(this._lastModifiedBy === value) return;
    this._lastModifiedBy = value;
  }
  private _name?: string | null;
  public get name(): string | null| undefined{ return this._name; }
  public set name(value: string | null| undefined){
    if(this._name === value) return;
    this._name = value;
  }
  private _siteUrl?: string | null;
  public get siteUrl(): string | null| undefined{ return this._siteUrl; }
  public set siteUrl(value: string | null| undefined){
    if(this._siteUrl === value) return;
    this._siteUrl = value;
  }
  private _tenants?: Array<string> | null;
  public get tenants(): Array<string> | null| undefined{ return this._tenants; }
  public set tenants(value: Array<string> | null| undefined){
    if(this._tenants === value) return;
    this._tenants = value;
  }
  toJSON(): IMarca{
    return {
          code:this._code,
          createdAt:this._createdAt,
          createdBy:this._createdBy,
          description:this._description,
          internalId:this._internalId,
          lastModifiedAt:this._lastModifiedAt,
          lastModifiedBy:this._lastModifiedBy,
          name:this._name,
          siteUrl:this._siteUrl,
          tenants:this._tenants,
    }
  }
}
