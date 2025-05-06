import { Component, Input, TemplateRef } from '@angular/core';
import { IListOptions } from '../models/i-list-options';

@Component({
  selector: 'ci-data-list',
  templateUrl: './data-list.component.html',
  styleUrl: './data-list.component.scss',
  standalone: false
})
export class DataListComponent<T> {
  @Input()
  source?: T[];
  @Input()
  options?: IListOptions<T>;
  @Input()
  templateItem?: TemplateRef<any>;
  constructor() { }
}
