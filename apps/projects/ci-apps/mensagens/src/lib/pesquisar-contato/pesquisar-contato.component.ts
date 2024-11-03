import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'ci-pesquisar-contato',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatDialogModule,
  ],
  templateUrl: './pesquisar-contato.component.html',
  styleUrl: './pesquisar-contato.component.scss'
})
export class PesquisarContatoComponent {
  constructor(
    private readonly ref?: MatDialogRef<PesquisarContatoComponent>,
  ) { }
}
