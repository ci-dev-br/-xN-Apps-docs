/* tslint:disable */
/* eslint-disable */
import { Photo } from '../models/photo';
import { Policy } from '../models/policy';
import { Tenant } from '../models/tenant';
export interface IUser {
  email?: string | null;
  emailVerificado?: boolean | null;
  fullName?: string | null;
  id?: string | null;
  permission?: Array<Policy> | null;
  phone?: string | null;
  photo?: Photo | null;
  refreshToken?: string | null;
  roles?: Array<string> | null;
  tenants?: Array<Tenant> | null;
  username?: string | null;
}
export class User implements IUser {
  static typeName = 'User';
  private _email?: string | null;
  public get email(): string | null| undefined{ return this._email; }
  public set email(value: string | null| undefined){
    if(this._email === value) return;
    this._email = value;
  }
  private _emailVerificado?: boolean | null;
  public get emailVerificado(): boolean | null| undefined{ return this._emailVerificado; }
  public set emailVerificado(value: boolean | null| undefined){
    if(this._emailVerificado === value) return;
    this._emailVerificado = value;
  }
  private _fullName?: string | null;
  public get fullName(): string | null| undefined{ return this._fullName; }
  public set fullName(value: string | null| undefined){
    if(this._fullName === value) return;
    this._fullName = value;
  }
  private _id?: string | null;
  public get id(): string | null| undefined{ return this._id; }
  public set id(value: string | null| undefined){
    if(this._id === value) return;
    this._id = value;
  }
  private _permission?: Array<Policy> | null;
  public get permission(): Array<Policy> | null| undefined{ return this._permission; }
  public set permission(value: Array<Policy> | null| undefined){
    if(this._permission === value) return;
    this._permission = value;
  }
  private _phone?: string | null;
  public get phone(): string | null| undefined{ return this._phone; }
  public set phone(value: string | null| undefined){
    if(this._phone === value) return;
    this._phone = value;
  }
  private _photo?: Photo | null;
  public get photo(): Photo | null| undefined{ return this._photo; }
  public set photo(value: Photo | null| undefined){
    if(this._photo === value) return;
    this._photo = value;
  }
  private _refreshToken?: string | null;
  public get refreshToken(): string | null| undefined{ return this._refreshToken; }
  public set refreshToken(value: string | null| undefined){
    if(this._refreshToken === value) return;
    this._refreshToken = value;
  }
  private _roles?: Array<string> | null;
  public get roles(): Array<string> | null| undefined{ return this._roles; }
  public set roles(value: Array<string> | null| undefined){
    if(this._roles === value) return;
    this._roles = value;
  }
  private _tenants?: Array<Tenant> | null;
  public get tenants(): Array<Tenant> | null| undefined{ return this._tenants; }
  public set tenants(value: Array<Tenant> | null| undefined){
    if(this._tenants === value) return;
    this._tenants = value;
  }
  private _username?: string | null;
  public get username(): string | null| undefined{ return this._username; }
  public set username(value: string | null| undefined){
    if(this._username === value) return;
    this._username = value;
  }
  toJSON(): IUser{
    return {
          email:this._email,
          emailVerificado:this._emailVerificado,
          fullName:this._fullName,
          id:this._id,
          permission:this._permission,
          phone:this._phone,
          photo:this._photo,
          refreshToken:this._refreshToken,
          roles:this._roles,
          tenants:this._tenants,
          username:this._username,
    }
  }
}
