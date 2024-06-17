import { Component, Input } from '@angular/core';
import { IListOptions } from './list-options';

@Component({
  selector: 'ci-data-list',
  templateUrl: './data-list.component.html',
  styleUrl: './data-list.component.scss'
})
export class DataListComponent<T> {
  @Input()
  source?: T[];
  @Input()
  options?: IListOptions<T>;
  constructor() { }
}
