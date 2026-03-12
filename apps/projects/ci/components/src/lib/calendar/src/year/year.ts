import { Component, Input, OnChanges, SimpleChange, SimpleChanges } from "@angular/core";
import { Month } from "../month/month";
import { CoreModule } from "@ci/core";

@Component({
    selector: 'ci-calendar-year',
    templateUrl: 'year.html',
    standalone: true,
    styleUrl: 'year.scss',
    imports: [
        Month,
        CoreModule,
    ]
})
export class Year implements OnChanges {
    @Input()
    currentYear?: Date;
    private _selectedDate?: Date | undefined;
    public get selectedDate(): Date | undefined {
        return this._selectedDate;
    }
    @Input()
    public set selectedDate(value: Date | undefined) {
        if (this._selectedDate === value) return;
        this._selectedDate = value;
    }
    @Input()
    monthsOfYear: Date[] = [];
    @Input()
    year?: number;
    ngOnChanges(changes: SimpleChanges<{ currentYear: Date }>): void {
        if (changes?.currentYear?.currentValue) {
            const year = changes.currentYear.currentValue.getFullYear();
            this.year = year;
            const months: Date[] = [];
            for (let index = 0; index < 12; index++) {
                const element = new Date(year, index, 1, 0, 0, 0, 0);
                months.push(element);
            }
            this.monthsOfYear = months;
        }
    }
}