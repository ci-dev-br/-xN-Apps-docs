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
  stage?: 'edit' | 'view';
  @Input()
  public set data(value: string | undefined) {
    this._data = value;
    this.update();
  }
  layout?: any;
  @Input()
  selecionado?: boolean;
  constructor() { }
  update() {
    this.layout = this.data?.split('-').map(v => Array(Number(v)).fill(0));
  }
  remove(pos: undefined | number = undefined) {
    if (!this.data) return;
    const g = this.data.split('-');
    if (pos != undefined) {
      g[pos] = String((Number(g[pos]) - 1) || 1);
    } else {

    }
    this.data = g.join('-')
  }
  add(pos: undefined | number = undefined) {
    if (!this.data) return;
    const g = this.data.split('-');
    if (pos != undefined) {
      g[pos] = String((Number(g[pos]) + 1) || 1);
    } else {

    }
    this.data = g.join('-')
  }
}
