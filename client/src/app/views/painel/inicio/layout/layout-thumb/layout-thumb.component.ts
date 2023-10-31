import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ci-layout-thumb',
  templateUrl: './layout-thumb.component.html',
  styleUrls: ['./layout-thumb.component.scss']
})
export class LayoutThumbComponent {
  @Input() stage?: 'edit' | 'view';
  @Input() selecionado?: boolean;
  @Input() layout?: any;
  private _data?: string | undefined;
  public get data(): string | undefined {
    return this._data;
  }
  @Input() public set data(value: string | undefined) {
    this._data = value;
    this.update();
    this.dataChange.emit(this._data);
  }
  @Output() dataChange = new EventEmitter<string | undefined>();
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
      // TODO: adicionar remoção de linha
    }
    this.data = g.join('-')
  }
  add(pos: undefined | number = undefined) {
    if (!this.data) return;
    const g = this.data.split('-');
    if (pos != undefined) {
      g[pos] = String((Number(g[pos]) + 1) || 1);
    } else {
      // TODO: adicionar remoção de linha 
    }
    this.data = g.join('-')
  }
}
