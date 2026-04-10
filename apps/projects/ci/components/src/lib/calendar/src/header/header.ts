import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CalendarDay } from "../calendar-day";
import { CoreModule } from "@ci/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";

@Component({
    selector: 'ci-calendar-header',
    standalone: true,
    imports: [
        CoreModule,
        MatIconModule,
        MatButtonModule,
        MatToolbarModule,
    ],
    templateUrl: 'header.html'
})
export class HeaderCalendar {
    @Input() currentViewDate: Date = new Date(); // Data de referência para o mês visível
    private _viewMode?: 'day' | 'month' | 'year' | undefined;
    public get viewMode(): 'day' | 'month' | 'year' | undefined {
        return this._viewMode;
    }
    @Output() viewModeOutput = new EventEmitter<'day' | 'month' | 'year' | undefined>();
    @Input()
    public set viewMode(value: 'day' | 'month' | 'year' | undefined) {
        if (this._viewMode === value) return;
        this._viewMode = value;
        this.viewModeOutput.emit(value);
    }
    @Input() weekDays?: any[]; // = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    @Input() days?: CalendarDay[];// = [
    //{ date: new Date(), dayNumber: 1, },
    //];
    @Input() current?: Date;// = new Date();
    @Input() selectedDate?: Date;// = new Date();

    @Output('prevMonth')
    prevMonthOutput = new EventEmitter<void>();

    prevMonth() {
        this.prevMonthOutput.emit()
    }
    @Output('goToToday')
    goToTodayOutput = new EventEmitter<void>();

    goToToday() {
        this.goToTodayOutput.emit()
    }
    @Output('nextMonth')
    nextMonthOutput = new EventEmitter<void>();

    nextMonth() {
        this.nextMonthOutput.emit()
    }
}