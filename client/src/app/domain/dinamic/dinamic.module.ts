import { Component, Input, ModuleWithProviders, NgModule, Provider } from "@angular/core";
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
export class DinamicModule {
    static forChild(s: {
        providers?: Provider[]
    }): ModuleWithProviders<DinamicModule> {
        return {
            ngModule: DinamicModule,
            providers: [
                ...(s.providers || []),
            ]
        }
    }
}