/* tslint:disable */
/* eslint-disable */
import { Option } from '../models/option';
export interface IPergunta {
  options?: Array<Option> | null;
  questao?: string | null;
  type?: string | null;
}

export class Pergunta implements IPergunta {
  static typeName = 'Pergunta';
  private _options?: Array<Option> | null;
  public get options(): Array<Option> | null| undefined{ return this._options; }
  public set options(value: Array<Option> | null| undefined){
    if(this._options === value) return;
    this._options = value;
  }
  private _questao?: string | null;
  public get questao(): string | null| undefined{ return this._questao; }
  public set questao(value: string | null| undefined){
    if(this._questao === value) return;
    this._questao = value;
  }
  private _type?: string | null;
  public get type(): string | null| undefined{ return this._type; }
  public set type(value: string | null| undefined){
    if(this._type === value) return;
    this._type = value;
  }
  toJSON(): IPergunta{
    return {
          options:this._options,
          questao:this._questao,
          type:this._type,
    }
  }
}
