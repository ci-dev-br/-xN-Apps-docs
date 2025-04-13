/* tslint:disable */
/* eslint-disable */
import { Prancheta } from '../models/prancheta';
export interface IPranchetaSyncPayloadDto {
  prancheta?: Prancheta | null;
}
export class PranchetaSyncPayloadDto implements IPranchetaSyncPayloadDto {
  static typeName = 'PranchetaSyncPayloadDto';
  private _prancheta?: Prancheta | null;
  public get prancheta(): Prancheta | null| undefined{ return this._prancheta; }
  public set prancheta(value: Prancheta | null| undefined){
    if(this._prancheta === value) return;
    this._prancheta = value;
  }
  toJSON(): IPranchetaSyncPayloadDto{
    return {
          prancheta:this._prancheta,
    }
  }
}
