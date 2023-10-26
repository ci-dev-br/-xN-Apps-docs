import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { FormComponent } from "./form.component";
import { CommonModule } from "@angular/common";

@NgModule({
    declarations: [
        FormComponent,
    ],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [
        FormComponent,
    ],
})
export class DinamicFormsModule { }