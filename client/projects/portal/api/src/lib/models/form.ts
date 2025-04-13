/* tslint:disable */
/* eslint-disable */
import { Perguntas } from '../models/perguntas';
export interface IForm {
  createdAt?: string | null;
  createdBy?: {
} | null;
  description?: string | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: {
} | null;
  perguntas?: Perguntas | null;
  tenants?: Array<string> | null;
  title?: string | null;
}
export class Form implements IForm {
  static typeName = 'Form';
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
  private _perguntas?: Perguntas | null;
  public get perguntas(): Perguntas | null| undefined{ return this._perguntas; }
  public set perguntas(value: Perguntas | null| undefined){
    if(this._perguntas === value) return;
    this._perguntas = value;
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
  toJSON(): IForm{
    return {
          createdAt:this._createdAt,
          createdBy:this._createdBy,
          description:this._description,
          internalId:this._internalId,
          lastModifiedAt:this._lastModifiedAt,
          lastModifiedBy:this._lastModifiedBy,
          perguntas:this._perguntas,
          tenants:this._tenants,
          title:this._title,
    }
  }
}
