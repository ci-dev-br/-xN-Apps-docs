import { Component } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { InputModule } from "@ci/components";
import { CoreModule } from "@ci/core";

@Component({
    standalone: true,
    imports: [
        CoreModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        InputModule,
        FormsModule,
        ReactiveFormsModule
    ],
    selector: 'ci-homepage',
    templateUrl: 'homepage.component.html',
    styleUrl: 'homepage.component.scss'
})
export class HomepageComponent {
    instances: { name: string, form: FormGroup }[] = [];
    constructor(
        private dialog: MatDialog,
        private formBuilder: FormBuilder,
    ) { }
    create() {

    }
    createNewInstanceCode() {
        const created = {
            name: 'Nova instância de modificação',
            form: this.formBuilder.group<any>({
                name: [, []],
            })
        };
        created.form.reset(created)
        created.form.valueChanges.subscribe(() => {
            Object.assign(created, created.form.getRawValue());
        })
        this.instances.push(created);
        /*  this.instances = [
             {
                 name: 'Nova instância de modificação'
             },
             ...this.instances
         ]; */
    }
    removerInstance(instance: { name: string, form: FormGroup }) {
        const pos = this.instances.indexOf(instance);
        if (pos > -1) {
            this.instances.splice(pos, 1);
        }
    }
}