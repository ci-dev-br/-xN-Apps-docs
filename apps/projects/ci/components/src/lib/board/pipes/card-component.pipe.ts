import { Inject, Optional, Pipe, PipeTransform } from "@angular/core";
import { Card } from "@ci/portal-api";
import { CardSetting, ImplCard } from "../card";

@Pipe({ name: 'cardComponent', pure: true })
export class CardComponentPipe implements PipeTransform {
    constructor(
        @Optional() @Inject(CardSetting)
        public cardsFound?: ImplCard[],
    ) { }
    transform(value: Card, ...args: any[]) {
        return this.cardsFound?.find(c => c.componentName === value?.componentName)
    }
}