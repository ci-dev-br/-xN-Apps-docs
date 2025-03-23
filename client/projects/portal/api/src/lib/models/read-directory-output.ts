/* tslint:disable */
/* eslint-disable */
export interface IReadDirectoryOutput {
  isDirectory?: boolean | null;
  isFIFO?: boolean | null;
  isFile?: boolean | null;
  isSocket?: boolean | null;
  isSymbolicLink?: boolean | null;
  name?: string | null;
  path?: string | null;
}

export class ReadDirectoryOutput implements IReadDirectoryOutput {
  static typeName = 'ReadDirectoryOutput';
  private _isDirectory?: boolean | null;
  public get isDirectory(): boolean | null| undefined{ return this._isDirectory; }
  public set isDirectory(value: boolean | null| undefined){
    if(this._isDirectory === value) return;
    this._isDirectory = value;
  }
  private _isFIFO?: boolean | null;
  public get isFIFO(): boolean | null| undefined{ return this._isFIFO; }
  public set isFIFO(value: boolean | null| undefined){
    if(this._isFIFO === value) return;
    this._isFIFO = value;
  }
  private _isFile?: boolean | null;
  public get isFile(): boolean | null| undefined{ return this._isFile; }
  public set isFile(value: boolean | null| undefined){
    if(this._isFile === value) return;
    this._isFile = value;
  }
  private _isSocket?: boolean | null;
  public get isSocket(): boolean | null| undefined{ return this._isSocket; }
  public set isSocket(value: boolean | null| undefined){
    if(this._isSocket === value) return;
    this._isSocket = value;
  }
  private _isSymbolicLink?: boolean | null;
  public get isSymbolicLink(): boolean | null| undefined{ return this._isSymbolicLink; }
  public set isSymbolicLink(value: boolean | null| undefined){
    if(this._isSymbolicLink === value) return;
    this._isSymbolicLink = value;
  }
  private _name?: string | null;
  public get name(): string | null| undefined{ return this._name; }
  public set name(value: string | null| undefined){
    if(this._name === value) return;
    this._name = value;
  }
  private _path?: string | null;
  public get path(): string | null| undefined{ return this._path; }
  public set path(value: string | null| undefined){
    if(this._path === value) return;
    this._path = value;
  }
  toJSON(): IReadDirectoryOutput{
    return {
          isDirectory:this._isDirectory,
          isFIFO:this._isFIFO,
          isFile:this._isFile,
          isSocket:this._isSocket,
          isSymbolicLink:this._isSymbolicLink,
          name:this._name,
          path:this._path,
    }
  }
}
