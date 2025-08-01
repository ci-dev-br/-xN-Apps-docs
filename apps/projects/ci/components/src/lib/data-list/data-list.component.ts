import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { IListOptions } from '../models/i-list-options';

@Component({
  selector: 'ci-data-list',
  templateUrl: './data-list.component.html',
  styleUrl: './data-list.component.scss',
  standalone: false
})
export class DataListComponent<I> {
  @Output()
  select = new EventEmitter<[I | I[], Event]>();
  @Input()
  source?: I[];
  @Input()
  options?: IListOptions<I>;
  @Input()
  templateItem?: TemplateRef<any>;
  selectedItem?: I;
  selectedItems?: I[];
  constructor() { }

  rowSelectionHandler(event: Event, row: I) {
    //if (this.selectionMode === 'row') {
    /*  if (event.ctrlKey) {
       if (row === this.selectedItem) {
         this.select.emit(undefined);
         this.selectedItem = undefined;
         return;
       }
     } */
    this.select.emit([row, event]);
    this.selectedItem = row;
  }
  // }
}
