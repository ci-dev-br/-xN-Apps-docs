import { Component, Input, ModuleWithProviders, NgModule, Provider } from "@angular/core";
import { FORM_OPTIONS, IFormOptions } from "src/app/components/dyn-form/i-form-options";
import { CoreModule } from "src/app/core/core.module";
export interface IInstruction {
    group?: IInstruction;
}
@Component({
    selector: 'ci-dynamic',
    template: ``
})
export class DynamicComponent {
    @Input()
    source?: IInstruction;
}
@NgModule({
    declarations: [
        DynamicComponent,
    ],
    imports: [
        CoreModule,
    ],
    exports: [
        DynamicComponent,
    ],
})
export class DynamicModule {
    static forFeature(s: {
        form?: IFormOptions,
        providers?: Provider[]
    }): ModuleWithProviders<DynamicModule> {
        return {
            ngModule: DynamicModule,
            providers: [
                ...(s.providers || []),
                { provide: s.form, useValue: FORM_OPTIONS },
            ]
        }
    }
}