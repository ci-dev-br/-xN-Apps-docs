/* tslint:disable */
/* eslint-disable */
export interface ITenant {
  id: string;
  name: string | null;
}
export class Tenant implements ITenant {
  static typeName = 'Tenant';
  private _id: string;
  public get id(): string{ return this._id; }
  public set id(value: string){
    if(this._id === value) return;
    this._id = value;
  }
  private _name: string | null;
  public get name(): string | null{ return this._name; }
  public set name(value: string | null){
    if(this._name === value) return;
    this._name = value;
  }
  toJSON(): ITenant{
    return {
          id:this._id,
          name:this._name,
    }
  }
}
