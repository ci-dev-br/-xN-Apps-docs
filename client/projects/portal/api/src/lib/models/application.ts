/* tslint:disable */
/* eslint-disable */
import { Domain } from '../models/domain';
export interface IApplication {
  categoria?: string | null;
  description?: string | null;
  domain?: Domain | null;
  domains?: Array<Domain> | null;
  icon?: string | null;
  id?: string | null;
  menuGroupName?: string | null;
  name?: string | null;
  roles?: Array<string> | null;
  url?: string | null;
}

export class Application implements IApplication {
  static typeName = 'Application';
  private _categoria?: string | null;
  public get categoria(): string | null| undefined{ return this._categoria; }
  public set categoria(value: string | null| undefined){
    if(this._categoria === value) return;
    this._categoria = value;
  }
  private _description?: string | null;
  public get description(): string | null| undefined{ return this._description; }
  public set description(value: string | null| undefined){
    if(this._description === value) return;
    this._description = value;
  }
  private _domain?: Domain | null;
  public get domain(): Domain | null| undefined{ return this._domain; }
  public set domain(value: Domain | null| undefined){
    if(this._domain === value) return;
    this._domain = value;
  }
  private _domains?: Array<Domain> | null;
  public get domains(): Array<Domain> | null| undefined{ return this._domains; }
  public set domains(value: Array<Domain> | null| undefined){
    if(this._domains === value) return;
    this._domains = value;
  }
  private _icon?: string | null;
  public get icon(): string | null| undefined{ return this._icon; }
  public set icon(value: string | null| undefined){
    if(this._icon === value) return;
    this._icon = value;
  }
  private _id?: string | null;
  public get id(): string | null| undefined{ return this._id; }
  public set id(value: string | null| undefined){
    if(this._id === value) return;
    this._id = value;
  }
  private _menuGroupName?: string | null;
  public get menuGroupName(): string | null| undefined{ return this._menuGroupName; }
  public set menuGroupName(value: string | null| undefined){
    if(this._menuGroupName === value) return;
    this._menuGroupName = value;
  }
  private _name?: string | null;
  public get name(): string | null| undefined{ return this._name; }
  public set name(value: string | null| undefined){
    if(this._name === value) return;
    this._name = value;
  }
  private _roles?: Array<string> | null;
  public get roles(): Array<string> | null| undefined{ return this._roles; }
  public set roles(value: Array<string> | null| undefined){
    if(this._roles === value) return;
    this._roles = value;
  }
  private _url?: string | null;
  public get url(): string | null| undefined{ return this._url; }
  public set url(value: string | null| undefined){
    if(this._url === value) return;
    this._url = value;
  }
  toJSON(): IApplication{
    return {
          categoria:this._categoria,
          description:this._description,
          domain:this._domain,
          domains:this._domains,
          icon:this._icon,
          id:this._id,
          menuGroupName:this._menuGroupName,
          name:this._name,
          roles:this._roles,
          url:this._url,
    }
  }
}
