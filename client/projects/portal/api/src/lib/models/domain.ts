/* tslint:disable */
/* eslint-disable */
export interface IDomain {
  aplications?: Array<Array<any>> | null;
  createdAt?: string | null;
  createdBy?: {
} | null;
  hostname?: string | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: {
} | null;
  tenants?: Array<string> | null;
  varified?: boolean | null;
}
export class Domain implements IDomain {
  static typeName = 'Domain';
  private _aplications?: Array<Array<any>> | null;
  public get aplications(): Array<Array<any>> | null| undefined{ return this._aplications; }
  public set aplications(value: Array<Array<any>> | null| undefined){
    if(this._aplications === value) return;
    this._aplications = value;
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
  private _hostname?: string | null;
  public get hostname(): string | null| undefined{ return this._hostname; }
  public set hostname(value: string | null| undefined){
    if(this._hostname === value) return;
    this._hostname = value;
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
  private _tenants?: Array<string> | null;
  public get tenants(): Array<string> | null| undefined{ return this._tenants; }
  public set tenants(value: Array<string> | null| undefined){
    if(this._tenants === value) return;
    this._tenants = value;
  }
  private _varified?: boolean | null;
  public get varified(): boolean | null| undefined{ return this._varified; }
  public set varified(value: boolean | null| undefined){
    if(this._varified === value) return;
    this._varified = value;
  }
  toJSON(): IDomain{
    return {
          aplications:this._aplications,
          createdAt:this._createdAt,
          createdBy:this._createdBy,
          hostname:this._hostname,
          internalId:this._internalId,
          lastModifiedAt:this._lastModifiedAt,
          lastModifiedBy:this._lastModifiedBy,
          tenants:this._tenants,
          varified:this._varified,
    }
  }
}
