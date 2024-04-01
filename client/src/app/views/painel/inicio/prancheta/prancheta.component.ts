import { Component, Input } from '@angular/core';
import { IWidgetLoadedData } from '../../config.service';
import { CoreModule } from 'src/app/core/core.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
// import { WidgetModule } from 'src/app/widgets/widgets.module';

@Component({
  selector: 'ci-prancheta',
  standalone: true,
  imports: [
    CoreModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    //  WidgetModule,
  ],
  templateUrl: './prancheta.component.html',
  styleUrl: './prancheta.component.scss'
})
export class PranchetaComponent {
  private _layout?: string | undefined | null;
  public get layout(): string | undefined | null {
    return this._layout;
  }
  @Input()
  public set layout(value: string | undefined) {
    if (this._layout === value) return;
    this._layout = value;
    if (this._layout && this.widgets) this.update();
  }
  private _widgets?: IWidgetLoadedData[] | undefined;
  public get widgets(): IWidgetLoadedData[] | undefined {
    return this._widgets;
  }
  @Input()
  public set widgets(value: IWidgetLoadedData[] | undefined) {
    if (this._widgets === value) return;
    this._widgets = value;
    if (this._layout && this.widgets) this.update();
  }
  _rows?: any[];
  update() {
    let cnt = 0;
    this._rows = this.layout?.split('-').map(n => new Array(Number(n)).fill('').map((e, i) => i)).map(e => {
      return {
        cols: e.map(p => {
          return {
            widgets: [(this.widgets || [])[cnt++]],
          }
        }),
      }
    });
    this._rows;
  }

  contextmenuHandler(event: PointerEvent | MouseEvent, widget: IWidgetLoadedData) {
    event.preventDefault();
    // if (widget._onConfig) this.updateCards();
    widget._onConfig = !widget._onConfig;
  }
}
