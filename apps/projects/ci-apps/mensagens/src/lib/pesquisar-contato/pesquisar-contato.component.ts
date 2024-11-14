import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'ci-pesquisar-contato',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './pesquisar-contato.component.html',
  styleUrl: './pesquisar-contato.component.scss'
})
export class PesquisarContatoComponent {
  constructor(
    private readonly ref?: MatDialogRef<PesquisarContatoComponent>,
  ) { }
  async search() {
      
  }
}
