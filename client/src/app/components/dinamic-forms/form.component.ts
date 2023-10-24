import { Component, Input } from "@angular/core";

@Component({
    selector: 'ci-form',
    template: ''
})
export class FormComponent {
    @Input()
    a?: any;
    constructor(
    ) { }
}