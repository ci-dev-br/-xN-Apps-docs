/* tslint:disable */
/* eslint-disable */
import { Card } from '../models/card';
export interface IPrancheta {
  cards?: Array<Card> | null;
  createdAt?: string | null;
  createdBy?: {
} | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: {
} | null;
  layout?: string | null;
  order?: number | null;
  tenants?: Array<string> | null;
  title?: string | null;
}
export class Prancheta implements IPrancheta {
  static typeName = 'Prancheta';
  private _cards?: Array<Card> | null;
  public get cards(): Array<Card> | null| undefined{ return this._cards; }
  public set cards(value: Array<Card> | null| undefined){
    if(this._cards === value) return;
    this._cards = value;
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
  private _layout?: string | null;
  public get layout(): string | null| undefined{ return this._layout; }
  public set layout(value: string | null| undefined){
    if(this._layout === value) return;
    this._layout = value;
  }
  private _order?: number | null;
  public get order(): number | null| undefined{ return this._order; }
  public set order(value: number | null| undefined){
    if(this._order === value) return;
    this._order = value;
  }
  private _tenants?: Array<string> | null;
  public get tenants(): Array<string> | null| undefined{ return this._tenants; }
  public set tenants(value: Array<string> | null| undefined){
    if(this._tenants === value) return;
    this._tenants = value;
  }
  private _title?: string | null;
  public get title(): string | null| undefined{ return this._title; }
  public set title(value: string | null| undefined){
    if(this._title === value) return;
    this._title = value;
  }
  toJSON(): IPrancheta{
    return {
          cards:this._cards,
          createdAt:this._createdAt,
          createdBy:this._createdBy,
          internalId:this._internalId,
          lastModifiedAt:this._lastModifiedAt,
          lastModifiedBy:this._lastModifiedBy,
          layout:this._layout,
          order:this._order,
          tenants:this._tenants,
          title:this._title,
    }
  }
}
