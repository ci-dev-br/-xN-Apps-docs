/* tslint:disable */
/* eslint-disable */
import { PhoneNumber } from '../models/phone-number';
export interface IDevicePayload {
  applicationId?: string | null;
  authentication?: string | null;
  id?: string | null;
  model?: string | null;
  name?: string | null;
  numbers?: Array<PhoneNumber> | null;
}
export class DevicePayload implements IDevicePayload {
  static typeName = 'DevicePayload';
  private _applicationId?: string | null;
  public get applicationId(): string | null| undefined{ return this._applicationId; }
  public set applicationId(value: string | null| undefined){
    if(this._applicationId === value) return;
    this._applicationId = value;
  }
  private _authentication?: string | null;
  public get authentication(): string | null| undefined{ return this._authentication; }
  public set authentication(value: string | null| undefined){
    if(this._authentication === value) return;
    this._authentication = value;
  }
  private _id?: string | null;
  public get id(): string | null| undefined{ return this._id; }
  public set id(value: string | null| undefined){
    if(this._id === value) return;
    this._id = value;
  }
  private _model?: string | null;
  public get model(): string | null| undefined{ return this._model; }
  public set model(value: string | null| undefined){
    if(this._model === value) return;
    this._model = value;
  }
  private _name?: string | null;
  public get name(): string | null| undefined{ return this._name; }
  public set name(value: string | null| undefined){
    if(this._name === value) return;
    this._name = value;
  }
  private _numbers?: Array<PhoneNumber> | null;
  public get numbers(): Array<PhoneNumber> | null| undefined{ return this._numbers; }
  public set numbers(value: Array<PhoneNumber> | null| undefined){
    if(this._numbers === value) return;
    this._numbers = value;
  }
  toJSON(): IDevicePayload{
    return {
          applicationId:this._applicationId,
          authentication:this._authentication,
          id:this._id,
          model:this._model,
          name:this._name,
          numbers:this._numbers,
    }
  }
}
