/* tslint:disable */
/* eslint-disable */
export interface IFiendClientByPayload {

  /**
   * Text of search Clients Disposes to send Message
   */
  cellPhone: string;

  /**
   * Text of search Clients Disposes to send Message
   */
  documentId: string;

  /**
   * Text of search Clients Disposes to send Message
   */
  search: string;

  /**
   * Text of search Clients Disposes to send Message
   */
  username: string;
}

export class FiendClientByPayload implements IFiendClientByPayload {
  static typeName = 'FiendClientByPayload';

  /**
   * Text of search Clients Disposes to send Message
   */
  private _cellPhone: string;
  public get cellPhone(): string{ return this._cellPhone; }
  public set cellPhone(value: string){
    if(this._cellPhone === value) return;
    this._cellPhone = value;
  }

  /**
   * Text of search Clients Disposes to send Message
   */
  private _documentId: string;
  public get documentId(): string{ return this._documentId; }
  public set documentId(value: string){
    if(this._documentId === value) return;
    this._documentId = value;
  }

  /**
   * Text of search Clients Disposes to send Message
   */
  private _search: string;
  public get search(): string{ return this._search; }
  public set search(value: string){
    if(this._search === value) return;
    this._search = value;
  }

  /**
   * Text of search Clients Disposes to send Message
   */
  private _username: string;
  public get username(): string{ return this._username; }
  public set username(value: string){
    if(this._username === value) return;
    this._username = value;
  }
  toJSON(): IFiendClientByPayload{
    return {
          cellPhone:this._cellPhone,
          documentId:this._documentId,
          search:this._search,
          username:this._username,
    }
  }
}
