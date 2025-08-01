/* tslint:disable */
/* eslint-disable */
import { CardOption } from '../models/card-option';
export interface ICard {
  componentName?: string | null;
  componentVersion?: string | null;
  settings?: CardOption | null;
}
export class Card implements ICard {
  static typeName = 'Card';
  private _componentName?: string | null;
  public get componentName(): string | null| undefined{ return this._componentName; }
  public set componentName(value: string | null| undefined){
    if(this._componentName === value) return;
    this._componentName = value;
  }
  private _componentVersion?: string | null;
  public get componentVersion(): string | null| undefined{ return this._componentVersion; }
  public set componentVersion(value: string | null| undefined){
    if(this._componentVersion === value) return;
    this._componentVersion = value;
  }
  private _settings?: CardOption | null;
  public get settings(): CardOption | null| undefined{ return this._settings; }
  public set settings(value: CardOption | null| undefined){
    if(this._settings === value) return;
    this._settings = value;
  }
  toJSON(): ICard{
    return {
          componentName:this._componentName,
          componentVersion:this._componentVersion,
          settings:this._settings,
    }
  }
}
