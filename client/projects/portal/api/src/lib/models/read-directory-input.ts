/* tslint:disable */
/* eslint-disable */
export interface IReadDirectoryInput {
  path?: string | null;
}

export class ReadDirectoryInput implements IReadDirectoryInput {
  static typeName = 'ReadDirectoryInput';
  private _path?: string | null;
  public get path(): string | null| undefined{ return this._path; }
  public set path(value: string | null| undefined){
    if(this._path === value) return;
    this._path = value;
  }
  toJSON(): IReadDirectoryInput{
    return {
          path:this._path,
    }
  }
}
