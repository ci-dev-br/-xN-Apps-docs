/* tslint:disable */
/* eslint-disable */
export interface IPhoneNumber {
  carrierName: string;
  device: {
};
  subscriptionId: number;
}

export class PhoneNumber implements IPhoneNumber {
  static typeName = 'PhoneNumber';
  private _carrierName: string;
  public get carrierName(): string{ return this._carrierName; }
  public set carrierName(value: string){
    if(this._carrierName === value) return;
    this._carrierName = value;
  }
  private _device: {
};
  public get device(): {
}{ return this._device; }
  public set device(value: {
}){
    if(this._device === value) return;
    this._device = value;
  }
  private _subscriptionId: number;
  public get subscriptionId(): number{ return this._subscriptionId; }
  public set subscriptionId(value: number){
    if(this._subscriptionId === value) return;
    this._subscriptionId = value;
  }
  toJSON(): IPhoneNumber{
    return {
          carrierName:this._carrierName,
          device:this._device,
          subscriptionId:this._subscriptionId,
    }
  }
}
