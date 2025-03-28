import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'ci-pesquisar-contato',
  imports: [
    MatToolbarModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: './pesquisar-contato.component.html',
  styleUrl: './pesquisar-contato.component.scss'
})
export class PesquisarContatoComponent {
  form?: FormGroup = this.formBuilder?.group({
    search: [, []]
  });
  constructor(
    private readonly ref?: MatDialogRef<PesquisarContatoComponent>,
    private readonly formBuilder?: FormBuilder,
  ) { }
  async search() {
  }
  @HostListener('keydown.enter', ['$event'])
  async keyDownEnterHandler() {
    this.ref?.close(this.form);
  }

}
