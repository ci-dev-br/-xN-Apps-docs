/* tslint:disable */
/* eslint-disable */
import { User } from '../models/user';
export interface IAcessoPayload {
  bearer?: string;
  chaveAcesso?: string;
  identificacao?: string;
  mode?: string;
  password?: string;
  refreshToken?: string;
  solicitarSessao?: string;
  user?: User;
}

export class AcessoPayload implements IAcessoPayload {
  static typeName = 'AcessoPayload';
  private _bearer?: string;
  public get bearer(): string| undefined{ return this._bearer; }
  public set bearer(value: string| undefined){
    if(this._bearer === value) return;
    this._bearer = value;
  }
  private _chaveAcesso?: string;
  public get chaveAcesso(): string| undefined{ return this._chaveAcesso; }
  public set chaveAcesso(value: string| undefined){
    if(this._chaveAcesso === value) return;
    this._chaveAcesso = value;
  }
  private _identificacao?: string;
  public get identificacao(): string| undefined{ return this._identificacao; }
  public set identificacao(value: string| undefined){
    if(this._identificacao === value) return;
    this._identificacao = value;
  }
  private _mode?: string;
  public get mode(): string| undefined{ return this._mode; }
  public set mode(value: string| undefined){
    if(this._mode === value) return;
    this._mode = value;
  }
  private _password?: string;
  public get password(): string| undefined{ return this._password; }
  public set password(value: string| undefined){
    if(this._password === value) return;
    this._password = value;
  }
  private _refreshToken?: string;
  public get refreshToken(): string| undefined{ return this._refreshToken; }
  public set refreshToken(value: string| undefined){
    if(this._refreshToken === value) return;
    this._refreshToken = value;
  }
  private _solicitarSessao?: string;
  public get solicitarSessao(): string| undefined{ return this._solicitarSessao; }
  public set solicitarSessao(value: string| undefined){
    if(this._solicitarSessao === value) return;
    this._solicitarSessao = value;
  }
  private _user?: User;
  public get user(): User| undefined{ return this._user; }
  public set user(value: User| undefined){
    if(this._user === value) return;
    this._user = value;
  }
  toJSON(): IAcessoPayload{
    return {
          bearer:this._bearer,
          chaveAcesso:this._chaveAcesso,
          identificacao:this._identificacao,
          mode:this._mode,
          password:this._password,
          refreshToken:this._refreshToken,
          solicitarSessao:this._solicitarSessao,
          user:this._user,
    }
  }
}
