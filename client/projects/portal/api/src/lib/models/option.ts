/* tslint:disable */
/* eslint-disable */
export interface IOption {
  label?: string | null;
  type?: string | null;
}

export class Option implements IOption {
  static typeName = 'Option';
  private _label?: string | null;
  public get label(): string | null| undefined{ return this._label; }
  public set label(value: string | null| undefined){
    if(this._label === value) return;
    this._label = value;
  }
  private _type?: string | null;
  public get type(): string | null| undefined{ return this._type; }
  public set type(value: string | null| undefined){
    if(this._type === value) return;
    this._type = value;
  }
  toJSON(): IOption{
    return {
          label:this._label,
          type:this._type,
    }
  }
}
