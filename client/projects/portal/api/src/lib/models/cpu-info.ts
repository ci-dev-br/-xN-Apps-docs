/* tslint:disable */
/* eslint-disable */
export interface ICpuInfo {
  external?: number | null;
  heapTotal?: number | null;
  heapUsed?: number | null;
  moment?: string | null;
  rss?: number | null;
  system?: number | null;
  user?: number | null;
}

export class CpuInfo implements ICpuInfo {
  static typeName = 'CpuInfo';
  private _external?: number | null;
  public get external(): number | null| undefined{ return this._external; }
  public set external(value: number | null| undefined){
    if(this._external === value) return;
    this._external = value;
  }
  private _heapTotal?: number | null;
  public get heapTotal(): number | null| undefined{ return this._heapTotal; }
  public set heapTotal(value: number | null| undefined){
    if(this._heapTotal === value) return;
    this._heapTotal = value;
  }
  private _heapUsed?: number | null;
  public get heapUsed(): number | null| undefined{ return this._heapUsed; }
  public set heapUsed(value: number | null| undefined){
    if(this._heapUsed === value) return;
    this._heapUsed = value;
  }
  private _moment?: string | null;
  public get moment(): string | null| undefined{ return this._moment; }
  public set moment(value: string | null| undefined){
    if(this._moment === value) return;
    this._moment = value;
  }
  private _rss?: number | null;
  public get rss(): number | null| undefined{ return this._rss; }
  public set rss(value: number | null| undefined){
    if(this._rss === value) return;
    this._rss = value;
  }
  private _system?: number | null;
  public get system(): number | null| undefined{ return this._system; }
  public set system(value: number | null| undefined){
    if(this._system === value) return;
    this._system = value;
  }
  private _user?: number | null;
  public get user(): number | null| undefined{ return this._user; }
  public set user(value: number | null| undefined){
    if(this._user === value) return;
    this._user = value;
  }
  toJSON(): ICpuInfo{
    return {
          external:this._external,
          heapTotal:this._heapTotal,
          heapUsed:this._heapUsed,
          moment:this._moment,
          rss:this._rss,
          system:this._system,
          user:this._user,
    }
  }
}
