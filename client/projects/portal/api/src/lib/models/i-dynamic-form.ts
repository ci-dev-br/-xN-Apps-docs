/* tslint:disable */
/* eslint-disable */
export interface IIDynamicForm {
  controls?: {
} | null;
  description?: string | null;
  title?: string | null;
}

export class IDynamicForm implements IIDynamicForm {
  static typeName = 'IDynamicForm';
  private _controls?: {
} | null;
  public get controls(): {
} | null| undefined{ return this._controls; }
  public set controls(value: {
} | null| undefined){
    if(this._controls === value) return;
    this._controls = value;
  }
  private _description?: string | null;
  public get description(): string | null| undefined{ return this._description; }
  public set description(value: string | null| undefined){
    if(this._description === value) return;
    this._description = value;
  }
  private _title?: string | null;
  public get title(): string | null| undefined{ return this._title; }
  public set title(value: string | null| undefined){
    if(this._title === value) return;
    this._title = value;
  }
  toJSON(): IIDynamicForm{
    return {
          controls:this._controls,
          description:this._description,
          title:this._title,
    }
  }
}
