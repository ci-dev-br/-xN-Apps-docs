import { Component, Input } from '@angular/core';

@Component({
  selector: 'ci-layout-thumb',
  templateUrl: './layout-thumb.component.html',
  styleUrls: ['./layout-thumb.component.scss']
})
export class LayoutThumbComponent {
  private _data?: string | undefined;
  public get data(): string | undefined {
    return this._data;
  }
  @Input()
  public set data(value: string | undefined) {
    this._data = value;
    this.update();
  }
  layout?: any;
  constructor() { }
  update() {
    this.layout = this.data?.split('-').map(v => Array(Number(v)).fill(0));
  }
}
