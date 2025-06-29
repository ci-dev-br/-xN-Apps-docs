import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MessagerService } from '../mensagens.service';

@Component({
  selector: 'ci-pesquisar-contato',
  imports: [
    MatToolbarModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
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
    private readonly ref: MatDialogRef<PesquisarContatoComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly mensager: MessagerService,
  ) { }
  async search() {
  }
  @HostListener('keydown.enter', ['$event'])
  async keyDownEnterHandler() {
    this.ref?.close(this.form);
  }

  async iniciarConversa(event: Event) {
    // this.ref?.close(this.form);
    /// this.mensager.inciarConversa();
  }

}
