/* tslint:disable */
/* eslint-disable */
export interface IRegistrarInputDto {
  email?: string;
  identificacao?: string;
  password?: string;
  phone?: string;
}
export class RegistrarInputDto implements IRegistrarInputDto {
  static typeName = 'RegistrarInputDto';
  private _email?: string;
  public get email(): string| undefined{ return this._email; }
  public set email(value: string| undefined){
    if(this._email === value) return;
    this._email = value;
  }
  private _identificacao?: string;
  public get identificacao(): string| undefined{ return this._identificacao; }
  public set identificacao(value: string| undefined){
    if(this._identificacao === value) return;
    this._identificacao = value;
  }
  private _password?: string;
  public get password(): string| undefined{ return this._password; }
  public set password(value: string| undefined){
    if(this._password === value) return;
    this._password = value;
  }
  private _phone?: string;
  public get phone(): string| undefined{ return this._phone; }
  public set phone(value: string| undefined){
    if(this._phone === value) return;
    this._phone = value;
  }
  toJSON(): IRegistrarInputDto{
    return {
          email:this._email,
          identificacao:this._identificacao,
          password:this._password,
          phone:this._phone,
    }
  }
}
