/* tslint:disable */
/* eslint-disable */
import { Pergunta } from '../models/pergunta';
export interface IPerguntas {
  perguntas?: Array<Pergunta> | null;
}
export class Perguntas implements IPerguntas {
  static typeName = 'Perguntas';
  private _perguntas?: Array<Pergunta> | null;
  public get perguntas(): Array<Pergunta> | null| undefined{ return this._perguntas; }
  public set perguntas(value: Array<Pergunta> | null| undefined){
    if(this._perguntas === value) return;
    this._perguntas = value;
  }
  toJSON(): IPerguntas{
    return {
          perguntas:this._perguntas,
    }
  }
}
