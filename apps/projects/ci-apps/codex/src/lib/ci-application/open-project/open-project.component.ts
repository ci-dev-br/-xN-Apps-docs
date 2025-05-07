import { Component } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { CoreModule } from "@ci/core";

@Component({
    selector: 'ci-open-project',
    template: `oi`,
    standalone: true,
    imports: [
        CoreModule,
        MatDialogModule,
    ]
})
export class OpenProjectComponent { }